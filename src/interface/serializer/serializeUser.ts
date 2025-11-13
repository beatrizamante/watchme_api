import { User } from "../../domain/user/User.ts";

export const UserSerializer = {
  serialize(user: Partial<User>) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
    };
  },
  serializeList(users: User[]) {
    return users.map(this.serialize);
  },
};
