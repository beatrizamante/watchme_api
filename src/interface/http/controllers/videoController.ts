import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod/v4";
import { findVideo } from "../../../application/queries/findVideo.ts";
import { findVideos } from "../../../application/queries/findVideos.ts";
import { createRequestScopedContainer } from "../_lib/index.ts";

export const videoController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const video: Buffer = (request.body as { file: Buffer }).file;
    const { createVideo } = createRequestScopedContainer();

    const result = await createVideo({
      video,
      userId,
    });

    return reply.status(201).send(result);
  },
  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const parseResult = DeleteVideoInput.safeParse(request.query);
    const { deleteVideo } = createRequestScopedContainer();

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const result = await deleteVideo({
      videoId: parseResult.data.id,
      userId,
    });

    return reply.status(200).send(result);
  },
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;

    const videos = await findVideos(userId);

    return reply.status(302).send(videos);
  },
  find: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const parseResult = FindVideoInput.safeParse(request.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const video = await findVideo(parseResult.data.id, userId);

    return reply.status(302).send(video);
  },
};

const DeleteVideoInput = z.object({
  id: z.number().nonnegative().nonoptional(),
});

const FindVideoInput = z.object({
  id: z.number().nonnegative().nonoptional(),
});
