import bcrypt from "bcryptjs";
import { ModelObject, ModelOptions, Pojo, RelationMappings } from "objection";
import { Roles } from "../../../interfaces/roles.ts";
import { BaseModel } from "./BaseModel.js";

type AuthParams = {
  email: string;
  password: string;
};

class UserModel extends BaseModel {
  static tableName = "users";

  id!: number;
  username!: string;
  email!: string;
  password!: string;
  encrypted_password!: string;
  role!: Roles;
  active!: boolean;

  static relationMappings: RelationMappings = {
    person: {
      relation: BaseModel.HasManyRelation,
      modelClass: "PersonModel",
      join: {
        from: "users.id",
        to: "people.user_id",
      },
    },
    profilePicture: {
      relation: BaseModel.HasOneRelation,
      modelClass: "ProfilePictureModel",
      join: {
        from: "users.id",
        to: "profile_pictures.user_id",
      },
    },
    video: {
      relation: BaseModel.HasManyRelation,
      modelClass: "VideoModel",
      join: {
        from: "users.id",
        to: "videos.user_id",
      },
    },
  };

  static async authenticate({
    email,
    password,
  }: AuthParams): Promise<UserModel | null> {
    return UserModel.query()
      .findOne({ email })
      .then(async (user) => {
        const isThisPasswordCorrect = Boolean(await user?.passwordIs(password));

        if (!user || !isThisPasswordCorrect) {
          return null;
        }

        return user;
      });
  }

  $parseJson(json: Pojo, opt?: ModelOptions | undefined): Pojo {
    const { password, ...actualJson } = json;

    const parsedJson = {
      ...super.$parseJson(actualJson, opt),
      encrypted_password: password
        ? bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        : null,
    };

    return parsedJson;
  }

  isAdmin() {
    return this.role === Roles.ADMIN;
  }

  isUser() {
    return this.role === Roles.USER;
  }

  isActive() {
    return this.active === true;
  }

  private async passwordIs(password: string) {
    return bcrypt.compare(password, this.encrypted_password);
  }
}

export { UserModel };
export type UserSchema = ModelObject<UserModel>;
