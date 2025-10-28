import { InvalidVideoError } from "../domain/applicationErrors.ts";

type VideoPolicyParams = {
  originalFilename: string;
};

export const videoPolicy = ({ originalFilename }: VideoPolicyParams) => {
  const allowedVideoExtensions = [
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".wmv",
    ".flv",
    ".webm",
    ".m4v",
  ];

  const fileExtension = originalFilename
    .toLowerCase()
    .substring(originalFilename.lastIndexOf("."));

  if (!allowedVideoExtensions.includes(fileExtension))
    throw new InvalidVideoError({
      message: `Only video files are allowed. Supported formats: ${allowedVideoExtensions.join(
        ", "
      )}`,
    });
};
