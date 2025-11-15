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
          202: {
            description:
              "Video analysis started - returns job ID for status checking",
            type: "object",
            properties: {
              message: { type: "string" },
              jobId: { type: "string", format: "uuid" },
              status: { type: "string" },
              estimatedTime: { type: "string" },
            },
            example: {
              message: "Video analysis started",
              jobId: "123e4567-e89b-12d3-a456-426614174000",
              status: "processing",
              estimatedTime: "2-5 minutes",
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
