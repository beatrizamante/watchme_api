import { aiApiClient } from "../../../interface/http/_lib/client.ts";

export const findPersonHandler = async ({
  person,
  video,
}: {
  person: any;
  video: any;
}) => {
  const findPersonResponse = await aiApiClient.post("/find", {
    person: {
      id: person.id,
      name: person.name,
      embedding: person.embedding.toString("base64"),
    },
    video: {
      id: video.id,
      path: video.path,
    },
  });

  if (!findPersonResponse.data) {
    throw new Error("No data returned from AI service");
  }

  return findPersonResponse.data;
};
