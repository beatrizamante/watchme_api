import { Roles } from "../../interfaces/roles.ts";
import { InvalidUserError } from "../applicationErrors.ts";

type CreateUserDTO = {
  id?: number;
  username: string;
  email: string;
  password: string;
  role: Roles;
  active: boolean;
};

export class User {
  public readonly id?: number;
  public readonly username: string;
  public readonly email: string;
  public readonly password: string;
  public readonly role: Roles;
  public readonly active: boolean;

  constructor(user: CreateUserDTO) {
    this.id = user.id;

    if (!user.username)
      throw new InvalidUserError({ message: "User needs an username " });
    this.username = user.username;

    if (!user.email)
      throw new InvalidUserError({ message: "User needs an email " });
    this.email = user.email;

    if (!user.password)
      throw new InvalidUserError({ message: "User needs a password " });

    if (user.password.length < 6)
      throw new InvalidUserError({
        message: "Password must contain at least 6 characters",
      });
    this.password = user.password;

    if (!Object.values(Roles).includes(user.role))
      throw new InvalidUserError({
        message: "User must be either an ADMIN or USER",
      });
    this.role = user.role;

    if (typeof user.active !== "boolean")
      throw new InvalidUserError({ message: "User must have a status" });
    this.active = user.active;
  }
}
