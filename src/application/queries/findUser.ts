import {
  InvalidUserError,
  UnauthorizedError,
} from "../../domain/applicationErrors.ts";
import { UserModel } from "../../infrastructure/database/models/UserModel.ts";

type FindUser = {
  id?: number;
  username?: string;
  email?: string;
  user_id: number;
};

export const findUser = async ({ id, username, email, user_id }: FindUser) => {
  const user = await UserModel.query().findById(user_id);

  if (!user || (!user.isAdmin() && !user.isUser(user_id)))
    throw new UnauthorizedError({
      message: "User cannot access this resource",
    });

  const query = UserModel.query();

  if (id !== undefined) {
    query.where("id", id);
  } else if (username !== undefined) {
    query.where("username", username);
  } else if (email !== undefined) {
    query.where("email", email);
  } else {
    throw new InvalidUserError({ message: "No filter provided" });
  }

  const foundUser = await query.first();

  if (!foundUser) {
    throw new InvalidUserError({ message: "This user doesn't exist" });
  }

  return foundUser;
};
