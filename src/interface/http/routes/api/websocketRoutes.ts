import type { FastifyInstance } from "fastify";
import { websocketController } from "../../controllers/websocketController.ts";
import { authentication } from "../../middleware/auth.ts";

export function websocketRoutes(fastify: FastifyInstance) {
  fastify.addHook("preValidation", authentication.isAuthenticated);

  fastify.get(
    "/ws/video-track",
    {
      websocket: true,
      schema: {
        summary: "Websocket for video observation.",
        tags: ["Websocket"],
        querystring: {
          type: "object",
          properties: {
            personId: { type: "number" },
          },
          required: ["personId"],
        },
      },
    },
    websocketController
  );
}
