import {
  DatabaseError,
  InvalidUserError,
  InvalidVideoError,
} from "../../../domain/applicationErrors.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { VideoModel } from "../../../infrastructure/database/models/VideoModel.ts";
import { VideoWithUser } from "./../../../interface/serializer/serializeVideo.ts";
import { VideoSerializer } from "../../../interface/serializer/serializeVideo.ts";

export const findVideo = async (id: number, user_id: number) => {
  try {
    const user = await UserModel.query().findById(user_id);

    if (!user)
      throw new InvalidUserError({
        message: "This user cannot access this resource",
      });

    if (user.isAdmin()) {
      const video = (await VideoModel.query()
        .join("users", "videos.user_id", "users.id")
        .findById(id)
        .select("videos.*", "users.username")) as unknown as VideoWithUser;

      if (!video)
        throw new InvalidVideoError({
          message: "This video doesn't exist",
        });

      return video;
    }

    const video = (await VideoModel.query()
      .join("users", "videos.user_id", "users.id")
      .where("videos.id", id)
      .where("videos.user_id", user_id)
      .first()
      .select("videos.*", "users.username")) as unknown as VideoWithUser;

    if (!video)
      throw new InvalidVideoError({ message: "This video doesn't exist" });

    return VideoSerializer.serialize(video);
  } catch (error) {
    throw new DatabaseError({
      message: `There was an error retrieving this video: ${error}`,
    });
  }
};
