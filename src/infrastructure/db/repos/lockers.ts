import { and, eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import ILockersRepo from "../../../usecases/interfaces/repos/lockers";
import {
	DeploymentRecord,
	LockerInDb,
	LockerRepoAdapter,
	UpdateLockerRepoAdapter,
} from "../../../usecases/schemas/lockers";
import DuplicateRecordError from "../errors";
import deployments from "../models/deployments";
import lockers from "../models/lockers";

export default class LockersRepo implements ILockersRepo {
	// eslint-disable-next-line no-empty-function
	constructor(private db: PostgresJsDatabase) {}

	async create(locker: LockerRepoAdapter): Promise<LockerInDb> {
		try {
			const result = await this.db
				.insert(lockers)
				.values({
					userId: locker.userId,
					seed: locker.seed,
					provider: locker.provider,
					ownerAddress: locker.ownerAddress.toLowerCase(),
					address: locker.address.toLowerCase(),
				})
				.returning();

			const createdLocker = await this.retrieve({ id: result[0].id });
			return createdLocker as LockerInDb;
		} catch (error: unknown) {
			const e = error as { code?: string; message: string };
			if (e.code === "23505") {
				throw new DuplicateRecordError("Locker already exists.");
			}
			throw new Error(e.message);
		}
	}

	async update(
		lockerId: number,
		updates: UpdateLockerRepoAdapter
	): Promise<LockerInDb | null> {
		if (Object.keys(updates).length === 0) {
			throw new Error("No updates provided.");
		}

		if (updates.deploymentTxHash && updates.chainId !== undefined) {
			try {
				await this.db.insert(deployments).values({
					lockerId,
					txHash: updates.deploymentTxHash,
					chainId: updates.chainId,
				});
			} catch (error: unknown) {
				const e = error as { code?: string; message: string };
				if (e.code === "23505") {
					throw new DuplicateRecordError(
						"Deployment already exists."
					);
				}
				throw new Error(e.message);
			}
		}

		const updatesCopy = { ...updates };

		if (updates.ownerAddress !== undefined) {
			updatesCopy.ownerAddress = updatesCopy.ownerAddress!.toLowerCase();
			await this.db
				.update(lockers)
				.set(updatesCopy)
				.where(eq(lockers.id, lockerId));
		}

		return this.retrieve({ id: lockerId });
	}

	async retrieve(options: {
		address?: string;
		id?: number;
	}): Promise<LockerInDb | null> {
		let condition;
		if (options.id) {
			condition = eq(lockers.id, options.id);
		} else if (options.address) {
			condition = eq(lockers.address, options.address.toLowerCase());
		} else {
			throw new Error("No valid identifier provided.");
		}

		// Retrieve the locker record with simplified conditional logic
		const lockerRecord = await this.db
			.select()
			.from(lockers)
			.where(condition)
			.limit(1)
			.execute();

		if (lockerRecord.length === 0) {
			return null;
		}

		const locker = lockerRecord[0] as LockerInDb;

		// Retrieve associated deployments
		const deploymentsRecords = await this.db
			.select()
			.from(deployments)
			.where(eq(deployments.lockerId, locker.id))
			.execute();

		locker.deployments = deploymentsRecords.map(
			(record) =>
				({
					id: record.id,
					lockerId: record.lockerId,
					txHash: record.txHash,
					chainId: record.chainId,
					createdAt: new Date(record.createdAt),
					updatedAt: new Date(record.updatedAt),
				}) as DeploymentRecord
		);

		return locker;
	}

	async retrieveMany(options: {
		userId?: string;
		ownerAddress?: string;
	}): Promise<LockerInDb[]> {
		const conditions = [];

		if (options.userId) {
			conditions.push(eq(lockers.userId, options.userId));
		}

		if (options.ownerAddress) {
			conditions.push(
				eq(lockers.ownerAddress, options.ownerAddress.toLowerCase())
			);
		}

		if (conditions.length === 0) {
			throw new Error("No valid conditions provided.");
		}

		const lockersResults = await this.db
			.select()
			.from(lockers)
			.where(and(...conditions))
			.execute();

		if (lockersResults.length === 0) {
			return [];
		}

		// Retrieve deployments for each locker and attach them
		const lockersWithDeployments = await Promise.all(
			lockersResults.map(async (locker) => {
				const deploymentsRecords = await this.db
					.select()
					.from(deployments)
					.where(eq(deployments.lockerId, locker.id))
					.execute();

				return {
					...locker,
					deployments: deploymentsRecords.map(
						(record) =>
							({
								id: record.id,
								lockerId: record.lockerId,
								txHash: record.txHash,
								chainId: record.chainId,
								createdAt: new Date(record.createdAt),
								updatedAt: new Date(record.updatedAt),
							}) as DeploymentRecord
					),
				} as LockerInDb;
			})
		);

		return lockersWithDeployments;
	}
}
