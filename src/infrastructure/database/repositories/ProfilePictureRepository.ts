import { Transaction } from "objection";
import { DatabaseError } from "../../../domain/applicationErrors.ts";
import { ProfilePicture } from "../../../domain/user/ProfilePicture.ts";
import { ProfilePictureInterface } from "../../../domain/user/ProfilePictureRepository.ts";
import { ProfilePictureModel } from "../models/ProfilePictureModel.ts";

export class ProfilePictureRepository implements ProfilePictureInterface {
  async findByUserId(user_id: number): Promise<ProfilePicture | undefined> {
    try {
      const profilePicture = await ProfilePictureModel.query()
        .where("user_id", user_id)
        .first();

      return profilePicture;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error searching the picture id: ${message}`,
      });
    }
  }

  async upsert(profilePicture: ProfilePicture, trx: Transaction) {
    try {
      const createdProfilePicture = await ProfilePictureModel.query(
        trx
      ).upsertGraphAndFetch(profilePicture);

      return createdProfilePicture;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error creating the picture: ${message}`,
      });
    }
  }

  async delete(
    profilePicture: ProfilePicture,
    trx: Transaction
  ): Promise<number> {
    try {
      const deletedProfilePicture =
        // biome-ignore lint/style/noNonNullAssertion: "The function is always being called only if the video is found"
        await ProfilePictureModel.query(trx).deleteById(profilePicture.id!);

      return deletedProfilePicture;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error on the database: ${message}`,
      });
    }
  }
}
