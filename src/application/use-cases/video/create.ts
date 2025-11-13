import {
  ExternalServiceError,
  InvalidVideoError,
} from "../../../domain/applicationErrors.ts";
import { Video } from "../../../domain/video/Video.ts";
import { VideoInterface } from "../../../domain/video/VideoRepository.ts";
import { VideoModel } from "../../../infrastructure/database/models/VideoModel.ts";
import { managePath } from "../../../infrastructure/systemfile/managePath.ts";
import { VideoSerializer } from "../../../interface/serializer/serializeVideo.ts";

type Dependencies = {
  videoRepository: VideoInterface;
};

type CreateVideoParams = {
  video: Buffer;
  originalFilename: string;
  userId: number;
};

export const makeCreateVideo =
  ({ videoRepository }: Dependencies) =>
  async ({ video, userId, originalFilename }: CreateVideoParams) => {
    const trx = await VideoModel.startTransaction();

    try {
      const fileName = crypto.randomUUID();
      const validPath = await managePath.save(
        video,
        fileName,
        originalFilename
      );

      if (!validPath)
        throw new ExternalServiceError({ message: "Cannot create path " });

      const validVideo = new Video({
        user_id: userId,
        path: validPath,
      });

      const createdVideo = await videoRepository.create(validVideo, trx);

      await trx.commit();

      return VideoSerializer.serialize(createdVideo);
    } catch (error) {
      await trx.rollback();

      throw new InvalidVideoError({
        message: `There was an error trying to create the video: ${error}`,
      });
    }
  };

export type CreateVideo = ReturnType<typeof makeCreateVideo>;
