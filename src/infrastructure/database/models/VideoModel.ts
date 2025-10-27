import { ModelObject, RelationMappings } from "objection";
import { BaseModel } from "./BaseModel.js";

class VideoModel extends BaseModel {
  static tableName = "videos";

  id!: number;
  user_id!: number;
  path!: string;

  static relationMappings: RelationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: "UserModel",
      join: {
        from: "videos.user_id",
        to: "users.id",
      },
    },
  };
}

export { VideoModel };
export type VideoSchema = ModelObject<VideoModel>;
