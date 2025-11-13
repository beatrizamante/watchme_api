import { asClass, asFunction, asValue, createContainer } from "awilix";
import {
  CreatePerson,
  makeCreatePerson,
} from "../application/use-cases/person/create.ts";
import {
  DeletePerson,
  makeDeletePerson,
} from "../application/use-cases/person/delete.ts";
import {
  CreateUser,
  makeCreateUser,
} from "../application/use-cases/user/create.ts";
import {
  DeletePicture,
  makeDeletePicture,
} from "../application/use-cases/user/profile-picture/delete.ts";
import {
  makeUpsertPicture,
  UpsertPicture,
} from "../application/use-cases/user/profile-picture/upsert.ts";
import {
  makeUpdateUser,
  UpdateUser,
} from "../application/use-cases/user/update.ts";
import {
  CreateVideo,
  makeCreateVideo,
} from "../application/use-cases/video/create.ts";
import {
  DeleteVideo,
  makeDeleteVideo,
} from "../application/use-cases/video/delete.ts";
import { Config, config } from "../config.ts";
import { ProfilePictureInterface } from "../domain/user/ProfilePictureRepository.ts";
import { UserInterface } from "../domain/user/UserRepository.ts";
import { VideoInterface } from "../domain/video/VideoRepository.ts";
import { PersonRepository } from "../infrastructure/database/repositories/PersonRepository.ts";
import { ProfilePictureRepository } from "../infrastructure/database/repositories/ProfilePictureRepository.ts";
import { UserRepository } from "../infrastructure/database/repositories/UserRepository.ts";
import { VideoRepository } from "../infrastructure/database/repositories/VideoRepository.ts";
import { Logger, makeLogger } from "./logger.ts";
import { PersonInterface } from "../domain/person/PersonRepository.ts";
import { QueueService } from "../domain/queueService.ts";
import { makeBullMQQueueService } from "../infrastructure/backgroundJobs/queues/makeQueues.ts";
import { Queue } from "bullmq";

export type Container = {
  config: Config;
  logger: Logger;
  createPerson: CreatePerson;
  deletePerson: DeletePerson;
  upsertPicture: UpsertPicture;
  deletePicture: DeletePicture;
  createUser: CreateUser;
  updateUser: UpdateUser;
  createVideo: CreateVideo;
  deleteVideo: DeleteVideo;
  videoRepository: VideoInterface;
  personRepository: PersonInterface;
  userRepository: UserInterface;
  profilePictureRepository: ProfilePictureInterface;
  queueService: QueueService<Queue>;
  connection: { host: string; port: number };
};

const awilixContainer = createContainer<Container>();

awilixContainer.register({
  config: asValue(config),
  logger: asFunction(makeLogger),
  createPerson: asFunction(makeCreatePerson),
  deletePerson: asFunction(makeDeletePerson),
  upsertPicture: asFunction(makeUpsertPicture),
  deletePicture: asFunction(makeDeletePicture),
  createUser: asFunction(makeCreateUser),
  updateUser: asFunction(makeUpdateUser),
  createVideo: asFunction(makeCreateVideo),
  deleteVideo: asFunction(makeDeleteVideo),
  videoRepository: asClass(VideoRepository),
  personRepository: asClass(PersonRepository),
  userRepository: asClass(UserRepository),
  profilePictureRepository: asClass(ProfilePictureRepository),
  connection: asFunction(({ config }) => config.redis),
  queueService: asFunction(makeBullMQQueueService),
});

export const container = awilixContainer;
