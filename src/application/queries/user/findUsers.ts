import { UnauthorizedError } from "../../../domain/applicationErrors.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { UserSerializer } from "../../../interface/serializer/serializeUser.ts";

type FindUsers = {
  active?: boolean;
  user_id: number;
};
export const findUsers = async ({ active, user_id }: FindUsers) => {
  const user = await UserModel.query().findById(user_id);

  if (!user || !user.isAdmin())
    throw new UnauthorizedError({
      message: "User cannot access this resource",
    });

  const query = UserModel.query();

  if (active) {
    query.where("active", active);
  }

  const users = await query.select();
  return UserSerializer.serializeList(users);
};
