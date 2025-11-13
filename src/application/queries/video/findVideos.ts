import { InvalidUserError } from "../../../domain/applicationErrors.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { VideoModel } from "../../../infrastructure/database/models/VideoModel.ts";
import { VideoWithUser } from "./../../../interface/serializer/serializeVideo.ts";
import { VideoSerializer } from "../../../interface/serializer/serializeVideo.ts";

export const findVideos = async (user_id: number) => {
  const user = await UserModel.query().findById(user_id);

  if (!user)
    throw new InvalidUserError({
      message: "This user cannot access this resource",
    });

  let videos: VideoWithUser[];

  if (user.isAdmin()) {
    videos = (await VideoModel.query()
      .join("users", "videos.user_id", "users.id")
      .select("videos.*", "users.username")) as unknown as VideoWithUser[];

    return VideoSerializer.serializeList(videos);
  }

  videos = (await VideoModel.query()
    .where("user_id", user_id)
    .join("users", "videos.user_id", "users.id")
    .select("videos.*", "users.username")) as unknown as VideoWithUser[];

  return VideoSerializer.serializeList(videos);
};
