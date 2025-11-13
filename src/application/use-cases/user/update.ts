import { InvalidUserError } from "../../../domain/applicationErrors.ts";
import { ProfilePictureInterface } from "../../../domain/user/ProfilePictureRepository.ts";
import { User } from "../../../domain/user/User.ts";
import { UserInterface } from "../../../domain/user/UserRepository.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { ProfilePictureSerializer } from "../../../interface/serializer/serializeProfilePicture.ts";
import { UserSerializer } from "../../../interface/serializer/serializeUser.ts";
import { UpsertPicture } from "./profile-picture/upsert.ts";

type Dependencies = {
  userRepository: UserInterface;
  profilePictureRepository: ProfilePictureInterface;
  upsertPicture: UpsertPicture;
};

type UpdateUserParams = {
  user: User;
  file?: Buffer;
  originalFilename?: string;
};

export const makeUpdateUser =
  ({ userRepository, profilePictureRepository, upsertPicture }: Dependencies) =>
  async ({ user, file, originalFilename }: UpdateUserParams) => {
    const trx = await UserModel.startTransaction();

    try {
      const updatedUser = await userRepository.update(user, trx);

      if (!updatedUser.id)
        throw new InvalidUserError({ message: "Couldn't update user" });

      let validPicture = await profilePictureRepository.findByUserId(
        updatedUser.id
      );

      if (file && file.length > 0) {
        validPicture = await upsertPicture({
          file,
          user_id: updatedUser.id,
          originalFilename,
          currentPicture: validPicture,
        });
      }

      await trx.commit();

      return {
        user: UserSerializer.serialize(updatedUser),
        profilePicture: validPicture
          ? ProfilePictureSerializer.serialize(validPicture)
          : null,
      };
    } catch (error) {
      await trx.rollback();

      throw new InvalidUserError({
        message: `Could not create user: ${error}`,
      });
    }
  };

export type UpdateUser = ReturnType<typeof makeUpdateUser>;
