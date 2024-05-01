import "dotenv/config";

import type { Config } from "drizzle-kit";

export default {
	schema: "./src/periphery/db/models/index.ts",
	out: "./drizzle/migrations",
	driver: "pg",
	dbCredentials: {
		connectionString: process.env.DB_URL!,
	},
} satisfies Config;
