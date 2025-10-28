import { InvalidVideoError } from "./applicationErrors.ts";

type CreateVideoDTO = {
  id?: number;
  user_id: number;
  path: string;
};

export class Video {
  public readonly id?: number;
  public readonly user_id: number;
  public readonly path: string;

  constructor(video: CreateVideoDTO) {
    this.id = video.id;

    if (!video.user_id)
      throw new InvalidVideoError({
        message: "Video must be related to an user",
      });
    this.user_id = video.user_id;

    if (!video.path)
      throw new InvalidVideoError({
        message: "Video needs to be saved in a path",
      });
    this.path = video.path;
  }
}
