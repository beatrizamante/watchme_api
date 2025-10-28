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
    "/person",
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
    "/person/find",
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
    "/person",
    {
      schema: {
        summary: "Create new person's embedding",
        tags: ["People"],
        consumes: ["multipart/form-data"],
        description: `Create a new user account with optional profile picture.

**Required form fields:**
- name (text): Person's name for annotation
- file (file): Person's full body picture (JPEG, PNG, etc.)

**Example multipart form:**
- name: "Roni Fabricio"
- file: [upload file]`,
      },
    },
    personController.create
  );

  fastify.delete(
    "/person",
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
