import "dotenv/config";

import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, {
	NextFunction,
	Request,
	RequestHandler,
	Response,
} from "express";
import morgan from "morgan";

import {
	CreateLockerRequest,
	LockerRepoAdapter,
} from "../../../../core/schemas/lockers";
import {
	AuthenticatedRequest,
	authRequired,
	getLockersRepo,
	logger,
	stream,
} from "../../../../dependencies";
import DuplicateRecordError from "../../../db/errors";

const lockerRouter = express.Router();
lockerRouter.use(express.json());
lockerRouter.use(morgan("combined", { stream }));

function validateRequest<T extends object>(type: {
	new (): T;
}): RequestHandler {
	return async (
		req: AuthenticatedRequest<Request>,
		res: Response,
		next: NextFunction
	) => {
		const input = plainToClass(type, req.body);
		const errors = await validate(input);
		if (errors.length > 0) {
			res.status(400).json(errors);
		} else {
			req.body = input; // Optionally, replace the req.body with the validated object
			next();
		}
	};
}

lockerRouter.post(
	"/create",
	authRequired,
	validateRequest(CreateLockerRequest),
	async (
		req: AuthenticatedRequest<Request>,
		res: Response
	): Promise<void> => {
		const locker: LockerRepoAdapter = {
			userId: req.auth.userId,
			seed: req.body.seed,
			provider: req.body.provider,
			ownerAddress: req.body.ownerAddress,
			address: req.body.address,
			chainId: req.body.chainId,
		};

		try {
			const lockersRepo = await getLockersRepo();
			await lockersRepo.create(locker);
			res.status(200).send({ message: "Locker created successfully." });
		} catch (error) {
			if (error instanceof DuplicateRecordError) {
				res.status(409).send({ error: error.message });
			}
		}
	}
);

lockerRouter.get(
	"/",
	authRequired,
	async (
		req: AuthenticatedRequest<Request>,
		res: Response
	): Promise<void> => {
		const lockersRepo = await getLockersRepo();
		const lockers = await lockersRepo.retrieveMany({
			userId: req.auth.userId,
		});
		res.status(200).json({ data: lockers });
	}
);

// note: needs to be below routes
lockerRouter.use(
	(
		err: Error,
		req: AuthenticatedRequest<Request>,
		res: Response,
		next: NextFunction
	): void => {
		logger.error(err.stack);
		res.status(401).send("Unauthenticated!");
		next();
	}
);

export default lockerRouter;
