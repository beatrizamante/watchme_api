import { Person } from "../../../domain/person/Person.ts";
import { Video } from "../../../domain/video/Video.ts";
import { aiApiClient } from "../../../interface/http/_lib/client.ts";

type FindPersonParams = {
  person: Person;
  video: Video;
};

export const findPersonHandler = async ({
  person,
  video,
}: FindPersonParams) => {
  const embeddingBuffer = Buffer.isBuffer(person.embedding)
    ? person.embedding
    : Buffer.from(person.embedding);

  const embeddingBase64 = embeddingBuffer.toString("base64");

  try {
    const result = await aiApiClient.post("/find", {
      person: {
        id: person.id,
        name: person.name,
        embedding: embeddingBase64,
      },
      video: {
        id: video.id,
        path: video.path,
      },
    });

    if (!result.data) {
      throw new Error("No data returned from AI service");
    }

    return result.data;
  } catch (error) {
    console.error("AI service error:", error);
    throw error;
  }
};
