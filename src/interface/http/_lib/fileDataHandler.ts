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
    let originalFilename = "uploaded_file";

    if (body.filename) {
      originalFilename = body.filename;
    } else if (body.fileName) {
      originalFilename = body.fileName;
    } else if (body.name) {
      originalFilename = body.name;
    }

    if (!originalFilename.includes(".")) {
      let mimeType = body.mimeType;
      if (!mimeType && base64Data.includes(",")) {
        const parts = base64Data.split(",");
        base64Data = parts[1];
        mimeType = parts[0].match(/data:([^;]+)/)?.[1];
      } else if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }

      if (mimeType) {
        const extensionMap: Record<string, string> = {
          "video/mp4": "mp4",
          "video/quicktime": "mov",
          "video/x-msvideo": "avi",
          "video/x-matroska": "mkv",
          "video/x-ms-wmv": "wmv",
          "video/x-flv": "flv",
          "video/webm": "webm",
          "video/x-m4v": "m4v",
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/gif": "gif",
          "image/webp": "webp",
          "image/bmp": "bmp",
          "image/tiff": "tiff",
          "image/svg+xml": "svg",
        };

        const extension = extensionMap[mimeType] || mimeType.split("/")[1];
        originalFilename = `${originalFilename}.${extension}`;
      }
    }

    try {
      const file = Buffer.from(base64Data, "base64");
      const bodyData = { ...body };
      delete bodyData.fileData;
      delete bodyData.filename;
      delete bodyData.fileName;
      delete bodyData.name;
      delete bodyData.mimeType;

      return { file, originalFilename, bodyData };
    } catch (error) {
      throw new Error("Invalid base64 data");
    }
  }

  throw new Error(
    "Unsupported content type. Use multipart/form-data or application/json"
  );
};
