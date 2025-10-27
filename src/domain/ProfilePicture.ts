import { InvalidProfilePictureError } from "./applicationErrors.ts";

type CreateProfilePictureDTO = {
  id?: number;
  user_id: number;
  path: string;
};

export class ProfilePicture {
  public readonly id?: number;
  public readonly user_id: number;
  public readonly path: string;

  constructor(profilePicture: CreateProfilePictureDTO) {
    this.id = profilePicture.id;

    if (!profilePicture.user_id)
      throw new InvalidProfilePictureError({
        message: "Profile picture must be related to an user",
      });
    this.user_id = profilePicture.user_id;

    if (!profilePicture.path)
      throw new InvalidProfilePictureError({
        message: "Profile picture needs to be saved in a path",
      });
    this.path = profilePicture.path;
  }
}
