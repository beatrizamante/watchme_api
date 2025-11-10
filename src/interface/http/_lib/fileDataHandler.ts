import { FastifyRequest } from "fastify";
import { multiformFilter } from "./multiformFilter.ts";

export type FileData = {
  file: Buffer;
  originalFilename: string;
  bodyData: Record<string, unknown>;
};

export const extractFileData = async (
  request: FastifyRequest
): Promise<FileData> => {
  const contentType = request.headers["content-type"] || "";

  if (contentType.includes("multipart/form-data")) {
    const parts = request.parts();
    const { file, originalFilename, bodyData } = await multiformFilter(parts);

    if (!file || !originalFilename) {
      throw new Error("File data is required");
    }

    return { file, originalFilename, bodyData };
  }

  if (contentType.includes("application/json")) {
    const body = request.body as any;

    if (!body.fileData) {
      throw new Error("fileData field is required for base64 uploads");
    }

    let base64Data = body.fileData;
    let originalFilename = body.filename || "uploaded_file";

    if (base64Data.includes(",")) {
      const parts = base64Data.split(",");
      base64Data = parts[1];

      if (!body.filename && parts[0].includes("/")) {
        const mimeType = parts[0].match(/data:([^;]+)/)?.[1];
        if (mimeType) {
          const extension = mimeType.split("/")[1];
          originalFilename = `uploaded_file.${extension}`;
        }
      }
    }

    try {
      const file = Buffer.from(base64Data, "base64");
      const bodyData = { ...body };
      delete bodyData.fileData;
      delete bodyData.filename;

      return { file, originalFilename, bodyData };
    } catch (error) {
      throw new Error("Invalid base64 data");
    }
  }

  throw new Error(
    "Unsupported content type. Use multipart/form-data or application/json"
  );
};
