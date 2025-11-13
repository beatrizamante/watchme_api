import { ProfilePicture } from "../../domain/user/ProfilePicture.ts";

export const ProfilePictureSerializer = {
  serialize(picture: ProfilePicture) {
    return {
      id: picture.id,
      user_id: picture.user_id,
      path: picture.path,
    };
  },
  serializeList(pictures: ProfilePicture[]) {
    return pictures.map(this.serialize);
  },
};
