import { UserModel } from "../../infrastructure/database/models/UserModel.ts";
import { VideoModel } from "../../infrastructure/database/models/VideoModel.ts";
import { VideoSerializer } from "../../interface/serializer/serializeVideo.ts";

export const findVideos = async (user_id: number) => {
  const user = await UserModel.query().findById(user_id);

  if (user?.isAdmin()) {
    return await VideoModel.query().select();
  }

  const videos = await VideoModel.query().where("user_id", user_id);

  return VideoSerializer.serializeList(videos);
};
