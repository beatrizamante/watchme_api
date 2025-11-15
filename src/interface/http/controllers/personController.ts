import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { logger } from "../../../_lib/logger.ts";
import { findPeople } from "../../../application/queries/person/findPeople.ts";
import { findPerson } from "../../../application/queries/person/findPerson.ts";
import { findVideo } from "../../../application/queries/video/findVideo.ts";
import {
  ExternalServiceError,
  InvalidPersonError,
} from "../../../domain/applicationErrors.ts";
import { queueService } from "../../../infrastructure/backgroundJobs/queueService.ts";
import { fileSizePolicy } from "../../../policies/fileSizePolicy.ts";
import { QUEUE_NAMES } from "../../../shared/queues.ts";
import { aiApiClient } from "../_lib/client.ts";
import { extractFileData } from "../_lib/fileDataHandler.ts";
import { createRequestScopedContainer } from "../_lib/index.ts";

export const personController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
      const userId = request.userId!;
      const { createPerson } = createRequestScopedContainer();
      const { file, bodyData } = await extractFileData(request);
      const parseResult = CreatePersonInput.safeParse(bodyData);

      if (!parseResult.success) {
        return reply.status(400).send({
          error: "Invalid input",
          details: parseResult.error.issues,
        });
      }

      fileSizePolicy({ file });

      const fileBase64 = file.toString("base64");

      const embeddingResponse = await aiApiClient.post("/upload-embedding", {
        image: fileBase64,
      });

      if (!embeddingResponse.data || !embeddingResponse.data.embedding) {
        throw new ExternalServiceError({
          message: "Cannot process request - no embedding returned",
        });
      }

      const embeddingBase64 = embeddingResponse.data.embedding;
      const embedding = Buffer.from(embeddingBase64, "base64");

      const result = await createPerson({
        person: {
          name: parseResult.data.name,
          user_id: userId,
          embedding,
        },
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

      throw new InvalidPersonError({ message: errorMessage });
    }
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const parseResult = DeletePersonInput.safeParse(request.query);
    const { deletePerson } = createRequestScopedContainer();

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const result = await deletePerson({
      personId: parseResult.data.id,
      userId,
    });

    return reply.status(203).send(result);
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;

    const people = await findPeople(userId);

    return reply.status(200).send(people);
  },

  find: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const parseResult = FindPerson.safeParse(request.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const person = await findPerson(parseResult.data.id, userId);

    return reply.status(200).send(person);
  },

  findInVideo: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const parseResult = FindPersonInVideo.safeParse(request.query);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const person = await findPerson(parseResult.data.id, userId);
    const video = await findVideo(parseResult.data.videoId, userId);

    if (!person || !video) {
      return reply.status(404).send({
        error: "Person or video not found",
      });
    }

    const jobId = crypto.randomUUID();

    try {
      const aiApiResult = await queueService.enqueueAndWait(
        QUEUE_NAMES.PREDICT_PERSON,
        `predict-${jobId}`,
        {
          person,
          video,
          userId,
          jobId,
        },
        600000
      );

      logger.info(
        `Completed prediction job ${jobId} - Person: ${person.id}, Video: ${video.id}`
      );

      return reply.status(200).send({
        success: true,
        data: aiApiResult,
        person: {
          id: person.id,
          name: person.name,
        },
        video: {
          id: video.id,
          path: video.path,
        },
      });
    } catch (error: any) {
      logger.error("Failed to process prediction job:", error);
      return reply.status(500).send({
        error: "Failed to analyze video",
        message: error.message,
      });
    }
  },
};

const CreatePersonInput = z.object({
  name: z.string().nonempty().nonoptional(),
});

const DeletePersonInput = z.object({
  id: z.number().nonnegative().nonoptional(),
});

const FindPerson = z.object({
  id: z.number().nonnegative().nonoptional(),
});

const FindPersonInVideo = z.object({
  id: z.number().nonnegative().nonoptional(),
  videoId: z.number().nonnegative().nonoptional(),
});

const CheckJobInput = z.object({
  jobId: z.string().nonempty(),
});
