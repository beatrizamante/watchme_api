import pino from "pino";

import { config } from "../config.ts";

export const logger = pino(config.logger[config.env]);

type Dependencies = {
  requestId: string;
  userId: string;
};

export const makeLogger = ({ requestId, userId }: Dependencies) => {
  return logger.child({ requestId, userId });
};

export type Logger = ReturnType<typeof makeLogger>;
