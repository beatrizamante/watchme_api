type ImagePolicyParams = {
  originalFilename: string;
};

export const imagePolicy = ({ originalFilename }: ImagePolicyParams) => {
  const allowedImageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".gif",
    ".webp",
    ".tiff",
    ".svg",
  ];
  const fileExtension = originalFilename
    .toLowerCase()
    .substring(originalFilename.lastIndexOf("."));
  if (!allowedImageExtensions.includes(fileExtension))
    throw new Error(
      `Only image files are allowed. Supported formats: ${allowedImageExtensions.join(
        ", "
      )}`
    );
};
