import { InvalidUserError } from "../../../domain/applicationErrors.ts";
import { User } from "../../../domain/User.ts";
import { UserInterface } from "../../../domain/UserRepository.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { UpsertPicture } from "./profile-picture/upsert.ts";

type Dependencies = {
  userRepository: UserInterface;
  upsertPicture: UpsertPicture;
};

type CreateUserParams = {
  user: User;
  file?: Buffer;
  originalFilename?: string;
};

export const makeCreateUser =
  ({ upsertPicture, userRepository }: Dependencies) =>
  async ({ user, file, originalFilename }: CreateUserParams) => {
    const trx = await UserModel.startTransaction();

    try {
      const validUser = new User(user);

      const newUser = await userRepository.create(validUser, trx);

      if (!newUser.id)
        throw new InvalidUserError({ message: "Couldn't create user" });

      let validPicture = {};
      if (file) {
        validPicture = await upsertPicture({
          file,
          user_id: newUser.id,
          originalFilename,
        });
      }

      await trx.commit();

      return { validPicture, newUser };
    } catch (error) {
      await trx.rollback();

      throw new InvalidUserError({
        message: `Could not create user: ${error}`,
      });
    }
  };

export type CreateUser = ReturnType<typeof makeCreateUser>;
