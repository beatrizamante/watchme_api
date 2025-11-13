import type { Knex } from "knex";
import { Roles } from "../../../shared/roles.ts";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  await knex("users").insert([
    {
      username: "Beatriz Amante",
      email: "beatriz@amante.com",
      encrypted_password: bcrypt.hashSync("abc123", bcrypt.genSaltSync(10)),
      role: Roles.USER,
      active: true,
    },
    {
      username: "Admin",
      email: "admin@amante.com",
      encrypted_password: bcrypt.hashSync("admin", bcrypt.genSaltSync(10)),
      role: Roles.ADMIN,
      active: true,
    },
  ]);
}
