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
        response: {
          302: {
            description: "List of people with their body embeddings",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                user_id: { type: "number" },
                name: { type: "string" },
                embedding: {
                  type: "string",
                  description: "Base64 encoded AES encrypted body embedding",
                  format: "byte",
                },
              },
            },
            example: [
              {
                id: 1,
                user_id: 5,
                name: "Roni Fabricio",
                embedding:
                  "MTIzNDU2Nzg5MDEyMzQ1NjEyMzQ1Njc4OTAxMjM0NTY3ODkw...",
              },
              {
                id: 2,
                user_id: 5,
                name: "Maria Silva",
                embedding:
                  "QWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkw...",
              },
            ],
          },
        },
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
          required: ["id"],
        },
        response: {
          302: {
            description: "A person object with embedded body features",
            type: "object",
            properties: {
              id: { type: "number" },
              user_id: { type: "number" },
              name: { type: "string" },
              embedding: {
                type: "string",
                description:
                  "Base64 encoded AES encrypted body embedding (binary data)",
                format: "byte",
              },
            },
            example: {
              id: 1,
              user_id: 5,
              name: "Roni Fabricio",
              embedding:
                "MTIzNDU2Nzg5MDEyMzQ1NjEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTA...",
            },
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
          required: ["id", "videoId"],
        },
        response: {
          200: {
            description: "Person detection results in video",
            type: "object",
            properties: {
              person: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  user_id: { type: "number" },
                  name: { type: "string" },
                },
              },
              video: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  user_id: { type: "number" },
                  path: { type: "string" },
                },
              },
              matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    distance: { type: "number", minimum: 0, maximum: 1 },
                    bounding_box: {
                      type: "object",
                      properties: {
                        x: { type: "number" },
                        y: { type: "number" },
                        width: { type: "number" },
                        height: { type: "number" },
                      },
                    },
                    timestamp: {
                      type: "number",
                      description: "Time in seconds",
                    },
                  },
                },
              },
              total_matches: { type: "number" },
            },
            example: {
              person: {
                id: 1,
                user_id: 5,
                name: "Roni Fabricio",
              },
              video: {
                id: 3,
                user_id: 5,
                path: "/uploads/videos/sample_video.mp4",
              },
              matches: [
                {
                  distance: 0.95,
                  bounding_box: { x: 100, y: 150, width: 200, height: 300 },
                  timestamp: 5.2,
                },
                {
                  distance: 0.87,
                  bounding_box: { x: 450, y: 200, width: 180, height: 280 },
                  timestamp: 12.8,
                },
              ],
              total_matches: 2,
            },
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
        description: `Create a new person embedding from a photo for AI body recognition.

**Required form fields:**
- name (text): Person's name for annotation
- file (file): Person's clear face picture (JPEG, PNG, etc.)

**Example multipart form:**
- name: "Roni Fabricio"
- file: [upload file]`,
        response: {
          201: {
            description: "Person created successfully with AI embedding",
            type: "object",
            properties: {
              id: { type: "number" },
              user_id: { type: "number" },
              name: { type: "string" },
              embedding: {
                type: "string",
                description: "Base64 encoded AES encrypted body embedding",
                format: "byte",
              },
            },
            example: {
              id: 1,
              user_id: 5,
              name: "Roni Fabricio",
              embedding:
                "MTIzNDU2Nzg5MDEyMzQ1NjEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTA...",
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
            example: {
              error: "To find a person, you need to add a picture",
            },
          },
        },
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
          required: ["id"],
        },
        response: {
          203: {
            description: "Person deleted successfully",
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
          },
          404: {
            description: "Person not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    personController.delete
  );
}
