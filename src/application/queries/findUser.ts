import {
  InvalidUserError,
  UnauthorizedError,
} from "../../domain/applicationErrors.ts";
import { UserModel } from "../../infrastructure/database/models/UserModel.ts";
import { UserSerializer } from "../../interface/serializer/serializeUser.ts";

type FindUser = {
  id: number;
  user_id: number;
};

export const findUser = async ({ id, user_id }: FindUser) => {
  const user = await UserModel.query().findById(user_id);

  if (!user || (!user.isAdmin() && !user.isUser(id)))
    throw new UnauthorizedError({
      message: "User cannot access this resource",
    });

  const query = UserModel.query().where("id", id);

  const foundUser = await query.first();

  if (!foundUser) {
    throw new InvalidUserError({ message: "This user doesn't exist" });
  }

  return UserSerializer.serialize(foundUser);
};
