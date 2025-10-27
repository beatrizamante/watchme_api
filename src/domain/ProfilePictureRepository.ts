import { Transaction } from "objection";
import { ProfilePictureModel } from "../infrastructure/database/models/ProfilePictureModel.ts";
import { ProfilePicture } from "./ProfilePicture.ts";

export interface ProfilePictureInterface {
  findByUserId: (user_id: number) => Promise<ProfilePicture | undefined>;
  upsert: (
    profilePicture: ProfilePicture,
    trx: Transaction
  ) => Promise<ProfilePictureModel>;
  delete: (profilePicture: ProfilePicture, trx: Transaction) => Promise<number>;
}
