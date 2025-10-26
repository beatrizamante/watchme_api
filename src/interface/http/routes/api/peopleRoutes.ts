import type { FastifyInstance } from "fastify";
import { personController } from "../../controllers/personController.ts";
import { authentication } from "../../middleware/auth.ts";

export function peopleApiRoutes(fastify: FastifyInstance) {
  fastify.addHook("preValidation", authentication.isAuthenticated);

  fastify.get(
    "/people",
    {
      schema: {
        summary: "List all people's embeddings in the user's account",
        tags: ["People"],
      },
    },
    personController.list
  );

  fastify.get(
    "/people",
    {
      schema: {
        summary: "Find a specific person",
        tags: ["People"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
      },
    },
    personController.find
  );

  fastify.get(
    "/people",
    {
      schema: {
        summary: "Find a specific person in video",
        tags: ["People"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "number" },
            videoId: { type: "number" },
          },
        },
      },
    },
    personController.findInVideo
  );

  fastify.post(
    "/people",
    {
      schema: {
        summary: "Create new person's embedding",
        tags: ["Person"],
        consumes: ["multipart/form-data"],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            picture: {
              type: "string",
              format: "binary",
              description: "Person picture file",
            },
          },
        },
        examples: [
          {
            name: "Beatriz",
          },
        ],
      },
    },
    personController.create
  );

  fastify.delete(
    "/people",
    {
      schema: {
        summary: "Delete person",
        tags: ["People"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
      },
    },
    personController.delete
  );
}
