import { InvalidUserError } from "../../../domain/applicationErrors.ts";
import { ProfilePictureInterface } from "../../../domain/ProfilePictureRepository.ts";
import { User } from "../../../domain/User.ts";
import { UserInterface } from "../../../domain/UserRepository.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { UpsertPicture } from "./profile-picture/upsert.ts";

type Dependencies = {
  userRepository: UserInterface;
  profilePictureRepository: ProfilePictureInterface;
  upsertPicture: UpsertPicture;
};

type UpdateUserParams = {
  user: User;
  file?: Buffer;
};

export const makeUpdateUser =
  ({ userRepository, profilePictureRepository, upsertPicture }: Dependencies) =>
  async ({ user, file }: UpdateUserParams) => {
    const trx = await UserModel.startTransaction();

    try {
      const validUpdatedUser = new User(user);

      const updatedUser = await userRepository.update(validUpdatedUser, trx);

      if (!updatedUser.id)
        throw new InvalidUserError({ message: "Couldn't update user" });

      let validPicture = await profilePictureRepository.findByUserId(
        updatedUser.id
      );

      if (file) {
        validPicture = await upsertPicture({
          file,
          user_id: updatedUser.id,
          currentPicture: validPicture,
        });
      }

      await trx.commit();

      return { validPicture, updatedUser };
    } catch (error) {
      await trx.rollback();

      throw new InvalidUserError({
        message: `Could not create user: ${error}`,
      });
    }
  };

export type UpdateUser = ReturnType<typeof makeUpdateUser>;
