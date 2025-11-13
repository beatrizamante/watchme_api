import type { Knex } from "knex";
import { Roles } from "../../../shared/roles.ts";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", (t) => {
    t.increments("id");
    t.string("username").notNullable();
    t.string("email").notNullable().unique();
    t.string("encrypted_password").notNullable();
    t.string("role").notNullable().defaultTo(Roles.USER);
    t.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
