type FileSizePolicyParams = {
  file: Buffer;
};

export const fileSizePolicy = ({ file }: FileSizePolicyParams) => {
  const maxFileSize = 100 * 1024 * 1024;
  if (file.length > maxFileSize)
    throw new Error("Video file size must be less than 100MB");
};
