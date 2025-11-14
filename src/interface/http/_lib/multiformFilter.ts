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
        if (part.fieldname === "fileData" && typeof part.value === "string") {
          try {
            const base64Data = part.value.toString().includes(",")
              ? part.value.toString().split(",")[1]
              : part.value.toString();

            file = Buffer.from(base64Data, "base64");
            originalFilename = (bodyData.filename as string) || "uploaded_file";
          } catch (error) {
            console.error("Error parsing base64 data:", error);
            bodyData[part.fieldname] = part.value;
          }
        } else {
          bodyData[part.fieldname] = part.value;
        }
      }
    }
  }

  return { bodyData, file, originalFilename };
};
