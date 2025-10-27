import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";

import { config } from "../../config.ts";
import { errorPlugin } from "./error/errorHandler.ts";
import { peopleApiRoutes } from "./routes/api/peopleRoutes.ts";
import { usersApiRoutes } from "./routes/api/usersRoutes.ts";
import { videosApiRoutes } from "./routes/api/videosRoutes.ts";
import { authRoute } from "./routes/authRoute.ts";

const makeServer = async () => {
  const server = Fastify({ logger: config.http.logger[config.env] });

  server.register(cors, {
    origin: true,
    credentials: false,
  });

  server.register(fastifyCookie);
  server.register(errorPlugin);

  server.register(swagger, {
    openapi: {
      info: {
        title: "Watch Me API",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  server.register(swaggerUi, { routePrefix: "/docs" });

  server.get("/docs-redirect", async (_request, reply) => {
    return reply.redirect("/docs", 301);
  });

  server.register(authRoute);
  server.register(peopleApiRoutes);
  server.register(usersApiRoutes);
  server.register(videosApiRoutes);

  return server;
};

export { makeServer };
