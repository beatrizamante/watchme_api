import * as fastifyMultipart from "@fastify/multipart";

export const multiformFilter = async (
  parts: AsyncIterableIterator<fastifyMultipart.Multipart>
) => {
  const bodyData: Record<string, unknown> = {};
  let file: Buffer | undefined;
  let originalFilename: string | undefined;

  for await (const part of parts) {
    if (part.type === "file") {
      file = await part.toBuffer();
      originalFilename = part.filename;
    } else {
      if (part.value && part.value.toString().trim() !== "") {
        bodyData[part.fieldname] = part.value;
      }
    }
  }

  return { bodyData, file, originalFilename };
};
