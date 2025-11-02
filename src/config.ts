import type { Knex } from "knex";
import pino from "pino";
import { Env, type EnvType } from "./_lib/env.ts";
import "dotenv";

const env = Env.string("ENVIRONMENT", "development") as EnvType;

const logger = {
  development: {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: {
    level: "info",
  },
  test: {
    level: "silent",
  },
};
const dbLogger = pino({ ...logger, level: "debug" });

const http = {
  port: Env.number("PORT", 3000),
  host: Env.string("HOST", "0.0.0.0"),
  baseUrl: Env.string("SERVER_BASE_URL", "http://localhost:3000"),
  apiBaseUrl: Env.string("AI_BASE_URL", "http://localhost:5000"),
};

const db = {
  development: {
    client: "postgresql",
    log: {
      warn: (message) => dbLogger.warn(message, "Knex"),
      error: (message) => dbLogger.error(message, "Knex"),
      debug: (message) => dbLogger.debug(message, "Knex"),
      inspectionDepth: Number.POSITIVE_INFINITY,
      enableColors: true,
    },
    connection: {
      database: Env.string("DATABASE_DB", "watchme_dev"),
      port: Env.number("DATABASE_PORT", 5432),
      user: Env.string("DATABASE_USER", "postgres"),
      password: Env.string("DATABASE_PASSWORD", "postgres"),
      host: Env.string("DATABASE_HOST", "127.0.0.1"),
    },
  } satisfies Knex.Config,

  test: {
    client: "postgresql",
    connection: {
      database: Env.string("TEST_DATABASE_DB", "watchme_test"),
      port: Env.number("TEST_DATABASE_PORT", 5432),
      user: Env.string("TEST_DATABASE_USER", "postgres"),
      password: Env.string("TEST_DATABASE_PASSWORD", "postgres"),
      host: Env.string("TEST_DATABASE_HOST", "127.0.0.1"),
    },
  },
} as const;

const secret = {
  sessionSecret: Env.string("SESSION_SECRET", "This session needs a secret"),
};

const config = { env, http, db, secret, logger };

type Config = typeof config;

export { config };
export type { Config };
