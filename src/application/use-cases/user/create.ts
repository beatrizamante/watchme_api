import { InvalidUserError } from "../../../domain/applicationErrors.ts";
import { User } from "../../../domain/user/User.ts";
import { UserInterface } from "../../../domain/user/UserRepository.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { UserSerializer } from "../../../interface/serializer/serializeUser.ts";

type Dependencies = {
  userRepository: UserInterface;
};

type CreateUserParams = {
  user: User;
};

export const makeCreateUser =
  ({ userRepository }: Dependencies) =>
  async ({ user }: CreateUserParams) => {
    const trx = await UserModel.startTransaction();

    try {
      const validUser = new User(user);

      const newUser = await userRepository.create(validUser, trx);

      if (!newUser.id)
        throw new InvalidUserError({ message: "Couldn't create user" });

      await trx.commit();

      return UserSerializer.serialize(newUser);
    } catch (error) {
      await trx.rollback();

      throw new InvalidUserError({
        message: `Could not create user: ${error}`,
      });
    }
  };

export type CreateUser = ReturnType<typeof makeCreateUser>;
