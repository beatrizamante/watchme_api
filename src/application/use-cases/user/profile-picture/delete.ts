import { InvalidProfilePictureError } from "../../../../domain/applicationErrors.ts";
import { ProfilePicture } from "../../../../domain/ProfilePicture.ts";
import { ProfilePictureInterface } from "../../../../domain/ProfilePictureRepository.ts";
import { ProfilePictureModel } from "../../../../infrastructure/database/models/ProfilePictureModel.ts";
import { managePath } from "../../../_lib/managePath.ts";

type Dependencies = {
  profilePictureRepository: ProfilePictureInterface;
};

type DeleteProfilePictureParams = {
  profilePicture: ProfilePicture;
};

export const makeDeletePicture =
  ({ profilePictureRepository }: Dependencies) =>
  async ({ profilePicture }: DeleteProfilePictureParams) => {
    const trx = await ProfilePictureModel.startTransaction();

    try {
      const isDeleted = profilePictureRepository.delete(profilePicture, trx);

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
