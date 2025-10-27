import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ExternalServiceError } from "../../domain/applicationErrors.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../../", "uploads");

export const managePath = {
  save: async (file: Buffer, filename: string): Promise<string> => {
    try {
      if (!fs.existsSync(uploadDir)) {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, file);
      return filePath;
    } catch (error) {
      throw new ExternalServiceError({
        message: `Failed to save file: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  },
  delete: async (imagePath: string) => {
    try {
      await fs.promises.unlink(imagePath);
    } catch (error) {
      throw new ExternalServiceError({
        message: `There was an error while deleting old image: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  },
};
