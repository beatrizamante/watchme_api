import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod/v4";
import { findVideo } from "../../../application/queries/video/findVideo.ts";
import { findVideos } from "../../../application/queries/video/findVideos.ts";
import { InvalidVideoError } from "../../../domain/applicationErrors.ts";
import { fileSizePolicy } from "../../../policies/fileSizePolicy.ts";
import { videoPolicy } from "../../../policies/videoPolicy.ts";
import { createRequestScopedContainer } from "../_lib/index.ts";
import { extractFileData } from "../_lib/fileDataHandler.ts";
import { logger } from "../../../_lib/logger.ts";

export const videoController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
      const userId = request.userId!;
      const { createVideo } = createRequestScopedContainer();
      const { file, originalFilename, bodyData } = await extractFileData(
        request
      );

      logger.debug({ bodyData, originalFilename }, "Video data received");

      fileSizePolicy({ file });
      videoPolicy({ originalFilename });

      const result = await createVideo({
        video: file,
        userId,
        originalFilename,
      });

      return reply.status(201).send(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      if (
        errorMessage.includes("fileData") ||
        errorMessage.includes("base64") ||
        errorMessage.includes("content type")
      ) {
        return reply.status(400).send({
          error: "Invalid file data",
          message: errorMessage,
        });
      }

      throw new InvalidVideoError({ message: errorMessage });
    }
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

    return reply.status(203).send(result);
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
