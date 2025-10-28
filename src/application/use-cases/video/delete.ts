import { InvalidVideoError } from "../../../domain/applicationErrors.ts";
import { VideoInterface } from "../../../domain/VideoRepository.ts";
import { VideoModel } from "../../../infrastructure/database/models/VideoModel.ts";
import { managePath } from "../../../infrastructure/systemfile/managePath.ts";
import { findVideo } from "../../queries/findVideo.ts";

type Dependencies = {
  videoRepository: VideoInterface;
};

type DeleteVideoParams = {
  videoId: number;
  userId: number;
};

export const makeDeleteVideo =
  ({ videoRepository }: Dependencies) =>
  async ({ videoId, userId }: DeleteVideoParams) => {
    const trx = await VideoModel.startTransaction();

    try {
      const validVideo = await findVideo(videoId, userId);

      if (!validVideo)
        throw new InvalidVideoError({ message: "This video doesn't exist" });

      const deleted = await videoRepository.delete(videoId, trx);

      await managePath.delete(validVideo.path);

      await trx.commit();

      return deleted;
    } catch (error) {
      await trx.rollback();

      throw new InvalidVideoError({ message: `Cannot delete video: ${error}` });
    }
  };

export type DeleteVideo = ReturnType<typeof makeDeleteVideo>;
