import {
  DatabaseError,
  InvalidUserError,
  InvalidVideoError,
} from "../../../domain/applicationErrors.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { VideoModel } from "../../../infrastructure/database/models/VideoModel.ts";
import { VideoSerializer } from "../../../interface/serializer/serializeVideo.ts";

export const findVideo = async (id: number, user_id: number) => {
  try {
    const user = await UserModel.query().findById(user_id);

    if (!user)
      throw new InvalidUserError({
        message: "This user cannot access this resource",
      });

    if (user.isAdmin()) {
      const video = await VideoModel.query().findById(id);

      if (!video)
        throw new InvalidVideoError({
          message: "This video doesn't exist",
        });

      return video;
    }

    const video = await VideoModel.query().findOne({ id, user_id });

    if (!video)
      throw new InvalidVideoError({ message: "This video doesn't exist" });

    return VideoSerializer.serialize(video);
  } catch (error) {
    throw new DatabaseError({
      message: `There was an error retrieving this video: ${error}`,
    });
  }
};
