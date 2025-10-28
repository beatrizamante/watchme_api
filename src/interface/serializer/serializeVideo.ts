import { VideoModel } from "../../infrastructure/database/models/VideoModel.ts";

export const VideoSerializer = {
  serialize(video: VideoModel) {
    return {
      id: video.id,
      user_id: video.user_id,
      path: video.path,
      created_at: video.created_at,
    };
  },
  serializeList(videos: VideoModel[]) {
    return videos.map(this.serialize);
  },
};
