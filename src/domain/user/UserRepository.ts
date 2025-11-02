import { Transaction } from "objection";
import { User } from "./User.ts";
export interface UserInterface {
  findById: (id: number) => Promise<Omit<User, "password"> | undefined>;
  findByUsername: (
    username: string
  ) => Promise<Omit<User, "password"> | undefined>;
  findByEmail: (email: string) => Promise<Omit<User, "password"> | undefined>;
  create: (user: User, trx: Transaction) => Promise<Omit<User, "password">>;
  update: (user: User, trx: Transaction) => Promise<Omit<User, "password">>;
}
