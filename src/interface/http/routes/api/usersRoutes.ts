import type { FastifyInstance } from "fastify";
import { userController } from "../../controllers/userController.ts";
import { authentication } from "../../middleware/auth.ts";

export function usersApiRoutes(fastify: FastifyInstance) {
  fastify.addHook("preValidation", authentication.isAuthenticated);

  fastify.get(
    "/users",
    {
      schema: {
        summary: "List all users",
        tags: ["Users"],
        querystring: {
          type: "object",
          properties: {
            active: { type: "string" },
          },
        },
        response: {
          302: {
            description: "List of users",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                username: { type: "string" },
                email: { type: "string" },
                role: { type: "string", enum: ["ADMIN", "USER"] },
                active: { type: "string" },
              },
            },
            example: [
              {
                id: 1,
                username: "johndoe",
                email: "john@example.com",
                role: "USER",
                active: true,
              },
              {
                id: 2,
                username: "janedoe",
                email: "jane@example.com",
                role: "USER",
                active: true,
              },
            ],
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
            example: {
              error: "Invalid input: active must be a string",
            },
          },
        },
      },
    },
    userController.list
  );

  fastify.get(
    "/user",
    {
      schema: {
        summary: "Find a specific user",
        tags: ["Users"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        response: {
          302: {
            description: "An user object",
            type: "object",
            properties: {
              id: { type: "number" },
              username: { type: "string" },
              email: { type: "string" },
              role: { type: "string", enum: ["ADMIN", "USER"] },
              active: { type: "string" },
            },
            example: {
              id: 1,
              username: "johndoe",
              email: "john@example.com",
              role: "USER",
              active: true,
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
              error: "Invalid input: id must be a number",
            },
          },
        },
      },
    },
    userController.find
  );

  fastify.delete(
    "/user/picture",
    {
      schema: {
        summary: "Delete the picture of a user",
        tags: ["Users"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        response: {
          204: {
            description: "Successfully deleted",
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
            example: {
              error: "Invalid input: id must be a number",
            },
          },
        },
      },
    },
    userController.delete
  );

  fastify.post(
    "/user",
    {
      schema: {
        summary: "Create a new user",
        tags: ["Users"],
        consumes: ["multipart/form-data"],
        description: `Create a new user account with optional profile picture.

**Required form fields:**
- username (text): User's unique username
- email (text): Valid email address
- password (text): Password (minimum 6 characters)

**Optional form fields:**
- profilePicture (file): User's profile picture (JPEG, PNG, etc.)

**Example multipart form:**
- username: "johndoe"
- email: "john@example.com"
- password: "securepassword123"
- profilePicture: [upload file]`,
        response: {
          201: {
            description: "User created successfully",
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  username: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string", enum: ["ADMIN", "USER"] },
                  active: { type: "string" },
                },
              },
              profilePicture: {
                type: ["object", "null"],
                properties: {
                  id: { type: "number" },
                  user_id: { type: "number" },
                  path: { type: "string" },
                },
              },
            },
            example: {
              user: {
                id: 1,
                username: "johndoe",
                email: "john@example.com",
                role: "USER",
                active: true,
              },
              profilePicture: {
                id: 1,
                user_id: 1,
                path: "/path/to/image/filename.extension",
              },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
            example: [
              {
                error: "Invalid input: email malformatted",
              },
              {
                error: "Invalid input: password must be greater than 6",
              },
            ],
          },
        },
      },
    },
    userController.create
  );

  fastify.patch(
    "/user",
    {
      schema: {
        summary: "Update a user",
        tags: ["Users"],
        querystring: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        consumes: ["multipart/form-data"],
        description: `Update user account information. All fields are optional - only provided fields will be updated.

**Optional form fields:**
- username (text): New username
- email (text): New email address
- password (text): New password (minimum 6 characters)
- role (text): User role ("ADMIN" or "USER")
- active (text): Account status ("true" or "false")
- profilePicture (file): New profile picture (existing picture preserved if not provided)

**Example multipart form (partial update):**
- email: "newemail@example.com"
- profilePicture: [upload new file]

**Note:** Existing profile picture will be kept if no new file is uploaded.`,
        response: {
          200: {
            description: "User updated successfully",
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  username: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string", enum: ["ADMIN", "USER"] },
                  active: { type: "string" },
                },
              },
              profilePicture: {
                type: ["object", "null"],
                properties: {
                  id: { type: "number" },
                  user_id: { type: "number" },
                  path: { type: "string" },
                },
              },
            },
            example: {
              user: {
                id: 1,
                username: "johndoe",
                email: "newemail@example.com",
                role: "USER",
                active: true,
              },
              profilePicture: {
                id: 1,
                user_id: 1,
                path: "/path/to/image/filename.extension",
              },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              error: { type: "string" },
              details: { type: "array" },
            },
            example: [
              {
                error: "Invalid input: Role must be either USER or ADMIN",
              },
            ],
          },
        },
      },
    },
    userController.update
  );
}
