import { Transaction } from "objection";
import { VideoModel } from "../infrastructure/database/models/VideoModel.ts";
import { Video } from "./Video.ts";

export interface VideoInterface {
  create: (video: Video, trx: Transaction) => Promise<VideoModel>;
  delete: (id: number, trx: Transaction) => Promise<number>;
}
