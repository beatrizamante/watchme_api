import { ModelObject, RelationMappings } from "objection";
import { BaseModel } from "./BaseModel.js";

class PersonModel extends BaseModel {
  static tableName = "people";

  id!: number;
  user_id!: number;
  name!: string;
  embedding!: Buffer;

  static relationMappings: RelationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: "UserModel",
      join: {
        from: "people.user_id",
        to: "users.id",
      },
    },
  };
}

export { PersonModel };
export type PersonSchema = ModelObject<PersonModel>;
