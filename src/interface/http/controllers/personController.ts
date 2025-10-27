import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { findPeople } from "../../../application/queries/findPeople.ts";
import { findPerson } from "../../../application/queries/findPerson.ts";
import { findVideo } from "../../../application/queries/findVideo.ts";
import {
  ExternalServiceError,
  InvalidPersonError,
} from "../../../domain/applicationErrors.ts";
import { aiApiClient } from "../_lib/client.ts";
import { createRequestScopedContainer } from "../_lib/index.ts";

export const personController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;

    const parts = request.parts();
    let file: Buffer | undefined;
    const bodyData: Record<string, unknown> = {};

    for await (const part of parts) {
      if (part.type === "file") {
        file = await part.toBuffer();
      } else {
        bodyData[part.fieldname] = part.value;
      }
    }

    const parseResult = CreatePersonInput.safeParse(bodyData);
    const { createPerson } = createRequestScopedContainer();

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    if (!file) {
      throw new InvalidPersonError({
        message: "To find a person, you need to add a picture",
      });
    }

    const fileBase64 = file.toString("base64");

    const embeddingResponse = await aiApiClient.post("/create_person", {
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

    return reply.status(302).send(people);
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

    return reply.status(302).send(person);
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

    // For person detection in video, send to detection endpoint
    const findPersonResponse = await aiApiClient.post("/find_person_in_video", {
      person: {
        id: person.id,
        name: person.name,
        embedding: person.embedding.toString("base64"), // Convert Buffer to base64 for API
      },
      video: {
        id: video.id,
        path: video.path,
        // Add other video fields your AI needs
      },
    });

    if (!findPersonResponse.data) {
      throw new ExternalServiceError({ message: "Cannot process request " });
    }

    // The AI returns JSON with matches array containing bbox and distance
    // Example: { matches: [{ bbox: [x, y, w, h], distance: 0.5 }] }
    const detectionResults = findPersonResponse.data;

    return reply.status(200).send({
      person,
      video,
      matches: detectionResults.matches || [],
      total_matches: detectionResults.matches?.length || 0,
    });
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
