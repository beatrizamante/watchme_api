import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import path from "path";

import { config } from "../../config.ts";
import { errorPlugin } from "./error/errorHandler.ts";
import { peopleApiRoutes } from "./routes/api/peopleRoutes.ts";
import { usersApiRoutes } from "./routes/api/usersRoutes.ts";
import { videosApiRoutes } from "./routes/api/videosRoutes.ts";
import { websocketRoutes } from "./routes/api/websocketRoutes.ts";
import { authRoute } from "./routes/authRoute.ts";

const makeServer = async () => {
  const server = Fastify({
    logger: config.logger[config.env],
    bodyLimit: 150 * 1024 * 1024,
  });

  server.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  server.register(fastifyCookie);
  server.register(websocket);
  server.register(multipart, {
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
  });

  server.register(fastifyStatic, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
    setHeaders: (res, _path) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  });

  server.register(errorPlugin);
  server.register(websocketRoutes);

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

  return server;
};

export { makeServer };
