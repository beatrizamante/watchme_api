import { Transaction } from "objection";
import { DatabaseError } from "../../../domain/applicationErrors.ts";
import { User } from "../../../domain/User.ts";
import { UserInterface } from "../../../domain/UserRepository.ts";
import { UserModel } from "../models/UserModel.ts";

export class UserRepository implements UserInterface {
  async findById(id: number) {
    try {
      const user = await UserModel.query().findById(id);

      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error searching for the id: ${message}`,
      });
    }
  }

  async findByUsername(username: string) {
    try {
      const user = await UserModel.query().findOne({ username });

      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error searching for the username: ${message}`,
      });
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await UserModel.query().findOne({ email });

      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      throw new DatabaseError({
        message: `There was an error searching for the email: ${message}`,
      });
    }
  }

  async create(user: User, trx: Transaction): Promise<Omit<User, "password">> {
    try {
      const createdUser = await UserModel.query(trx).insertAndFetch(user);

      return {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        active: createdUser.active,
        role: createdUser.role,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error creating the user: ${message}`,
      });
    }
  }

  async update(user: User, trx: Transaction): Promise<Omit<User, "password">> {
    try {
      if (!user.id)
        throw new DatabaseError({ message: "Cannot update inexistent user" });

      const updateData: Record<string, unknown> = {
        username: user.username,
        email: user.email,
        role: user.role,
        active: user.active,
      };

      if (user.password && user.password !== "dummy_password_for_validation") {
        updateData.password = user.password;
      }

      const updatedUser = await UserModel.query(trx).patchAndFetchById(
        user.id,
        updateData
      );

      return {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        active: updatedUser.active,
        role: updatedUser.role,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error updating the user: ${message}`,
      });
    }
  }
}
