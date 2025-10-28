import {
  FastifyError,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { BaseError, ERROR_CODES } from "../../../domain/applicationErrors.ts";

export const errorPlugin: FastifyPluginAsync = async (server, _options) => {
  server.setErrorHandler(
    (
      error: FastifyError | BaseError,
      _request: FastifyRequest,
      reply: FastifyReply
    ) => {
      if (error instanceof BaseError) {
        return reply.status(getStatusCode(error.code)).send({
          error: error.message,
          code: error.code,
        });
      }

      return reply.status(500).send({
        error: "Internal Server Error",
        code: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      });
    }
  );
};

const getStatusCode = (code: string) => {
  switch (code) {
    case ERROR_CODES.INVALID_PERSON_ERROR ||
      ERROR_CODES.INVALID_PROFILE_PICTURE_ERROR ||
      ERROR_CODES.INVALID_PERSON_ERROR ||
      ERROR_CODES.INVALID_VIDEO_ERROR:
      return 400;
    case ERROR_CODES.UNAUTHENTICATED_ERROR:
      return 403;
    case ERROR_CODES.UNAUTHORIZED_ERROR:
      return 401;
    case ERROR_CODES.EXTERNAL_SERVICE_ERROR:
      return 503;
    default:
      return 500;
  }
};
