import { InvalidProfilePictureError } from "../../../../domain/applicationErrors.ts";
import { ProfilePictureInterface } from "../../../../domain/ProfilePictureRepository.ts";
import { ProfilePictureModel } from "../../../../infrastructure/database/models/ProfilePictureModel.ts";
import { managePath } from "../../../_lib/managePath.ts";

type Dependencies = {
  profilePictureRepository: ProfilePictureInterface;
};

type DeleteProfilePictureParams = {
  id: number;
};

export const makeDeletePicture =
  ({ profilePictureRepository }: Dependencies) =>
  async ({ id }: DeleteProfilePictureParams) => {
    const trx = await ProfilePictureModel.startTransaction();

    try {
      const profilePicture = await profilePictureRepository.findByUserId(id);

      if (!profilePicture)
        throw new InvalidProfilePictureError({
          message: "Couldn't find profile picture to delete",
        });

      const isDeleted = await profilePictureRepository.delete(
        profilePicture,
        trx
      );

      await managePath.delete(profilePicture.path);

      await trx.commit();

      return isDeleted;
    } catch (error) {
      await trx.rollback();

      throw new InvalidProfilePictureError({
        message: `Cannot create or update picture: ${error}`,
      });
    }
  };

export type DeletePicture = ReturnType<typeof makeDeletePicture>;
