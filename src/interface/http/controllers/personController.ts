import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { findPeople } from "../../../application/queries/findPeople.ts";
import { findPerson } from "../../../application/queries/findPerson.ts";
import { findVideo } from "../../../application/queries/findVideo.ts";
import { ExternalServiceError } from "../../../domain/applicationErrors.ts";
import { createRequestScopedContainer } from "../_lib/index.ts";

export const personController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    // biome-ignore lint/style/noNonNullAssertion: "The user is always being checked through an addHook at the request level"
    const userId = request.userId!;
    const parseResult = CreatePersonInput.safeParse(request.body);
    const { createPerson } = createRequestScopedContainer(request);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Invalid input",
        details: parseResult.error.issues,
      });
    }

    const file: Buffer = (request.body as { file: Buffer }).file;

    const embeddingResponse = await fetch(
      "http://localhost:5000/upload-embedding",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file }),
      }
    );

    if (!embeddingResponse.ok) {
      throw new ExternalServiceError({ message: "Cannot process request " });
    }

    const embedding = (await embeddingResponse.json()) as Buffer;

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
    const { deletePerson } = createRequestScopedContainer(request);

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

    const findPersonResponse = await fetch(
      "http://localhost:5000/find/:personId",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ person, video }),
      }
    );

    if (!findPersonResponse.ok) {
      throw new ExternalServiceError({ message: "Cannot process request " });
    }

    return reply.status(302).send({ person, findPersonResponse });
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
