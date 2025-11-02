import type { FastifyInstance } from "fastify";
import { videoTracker } from "../../../websocket/websocketConnection.ts";
import { websocketController } from "../../controllers/websocketController.ts";
import { authentication } from "../../middleware/auth.ts";

export function websocketRoutes(fastify: FastifyInstance) {
  fastify.addHook("preValidation", authentication.isAuthenticated);

  fastify.get(
    "/ws/video-track/:personId/:videoId",
    {
      websocket: true,
    },
    websocketController
  );
}
