import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import websocket from "@fastify/websocket";
import Fastify from "fastify";

import { config } from "../../config.ts";
import { errorPlugin } from "./error/errorHandler.ts";
import { peopleApiRoutes } from "./routes/api/peopleRoutes.ts";
import { usersApiRoutes } from "./routes/api/usersRoutes.ts";
import { videosApiRoutes } from "./routes/api/videosRoutes.ts";
import { websocketRoutes } from "./routes/api/websocketRoutes.ts";
import { authRoute } from "./routes/authRoute.ts";

const makeServer = async () => {
  const server = Fastify({ logger: config.http.logger[config.env] });

  server.register(cors, {
    origin: true,
    credentials: false,
  });

  server.register(fastifyCookie);
  server.register(websocket);
  server.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
  });
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

  server.register(authRoute);
  server.register(peopleApiRoutes);
  server.register(usersApiRoutes);
  server.register(videosApiRoutes);
  server.register(websocketRoutes);

  return server;
};

export { makeServer };
