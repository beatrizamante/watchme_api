import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { config } from "../../../config.ts";
import { UnathenticatedError } from "../../../domain/applicationErrors.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";

export const authentication = {
  login: async (
    request: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply
  ) => {
    const { email, password } = request.body;
    const user = await UserModel.authenticate({ email, password });

    if (!user) {
      throw new UnathenticatedError({
        message: "Something went wrong, try again.",
      });
    }

    const token = jwt.sign({ userId: user.id }, config.secret.sessionSecret);

    reply.setCookie("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 30,
      sameSite: "none",
    });

    return reply.status(201).send({ message: "Login successful" });
  },

  logout: async (__: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie("token", { path: "/" });
    return reply.status(200).send({ message: "Logged Out" });
  },

  isAuthenticated: async (request: FastifyRequest, _: FastifyReply) => {
    try {
      const { token } = request.cookies;

      if (!token) {
        throw new UnathenticatedError({
          message: "Unauthorized, please log in first",
        });
      }

      const { userId } = jwt.verify(token, config.secret.sessionSecret) as {
        userId: number;
      };

      const user = await UserModel.query().findById(userId);

      if (!user) {
        throw new UnathenticatedError({
          message: "This user doesn't exist. Please log in again",
        });
      }

      request.userId = userId;
    } catch (error) {
      console.error(`Error loging: ${error}`);
      throw new UnathenticatedError({
        message: "There was an error authenticating the user",
      });
    }
  },
};
