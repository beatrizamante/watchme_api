export type VideoWithUser = {
  id: number;
  user_id: number;
  path: string;
  created_at: string;
  username: string;
};

export const VideoSerializer = {
  serialize(video: VideoWithUser) {
    return {
      id: video.id,
      user_id: video.user_id,
      username: video.username,
      path: video.path,
      created_at: video.created_at,
    };
  },
  serializeList(videos: VideoWithUser[]) {
    return videos.map(this.serialize);
  },
};
