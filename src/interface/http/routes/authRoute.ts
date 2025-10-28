import type { FastifyInstance } from "fastify";
import { userController } from "../controllers/userController.ts";
import { authentication } from "../middleware/auth.ts";

export function authRoute(fastify: FastifyInstance) {
  fastify.post(
    "/login",
    {
      schema: {
        summary: "Login a user",
        tags: ["Login"],
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
          examples: [
            {
              email: "beatriz@amante.com",
              password: "abc123",
            },
          ],
        },
        response: {
          201: {
            description: "Login successful",
            example: {
              message: "Login successful",
            },
          },
          403: {
            description: "Could not log in",
            example: {
              message: "Something went wrong, try again.",
            },
          },
        },
      },
    },
    authentication.login
  );

  fastify.post(
    "/logout",
    {
      schema: {
        summary: "Logout a user",
        tags: ["Login"],
        response: {
          201: {
            description: "Logout successful",
            example: {
              message: "Logged Out",
            },
          },
        },
      },
    },
    authentication.logout
  );

  fastify.post(
    "/register",
    {
      schema: {
        summary: "Register new user",
        tags: ["Login"],
        body: {
          type: "object",
          required: ["email", "username", "password"],
          properties: {
            email: { type: "string", format: "email" },
            username: { type: "string" },
            password: { type: "string", minLength: 6 },
          },
        },
        examples: [
          {
            email: "beatriz@amante.com",
            username: "beamante",
            password: "abc123",
          },
        ],
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
                  active: { type: "boolean" },
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
              profilePicture: {},
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
}
