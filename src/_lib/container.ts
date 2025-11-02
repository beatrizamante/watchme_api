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
import { PersonInterface } from "../domain/PersonRepository.ts";
import { ProfilePictureInterface } from "../domain/ProfilePictureRepository.ts";
import { UserInterface } from "../domain/UserRepository.ts";
import { VideoInterface } from "../domain/VideoRepository.ts";
import { PersonRepository } from "../infrastructure/database/repositories/PersonRepository.ts";
import { ProfilePictureRepository } from "../infrastructure/database/repositories/ProfilePictureRepository.ts";
import { UserRepository } from "../infrastructure/database/repositories/UserRepository.ts";
import { VideoRepository } from "../infrastructure/database/repositories/VideoRepository.ts";
import { Logger, makeLogger } from "./logger.ts";

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
});

export const container = awilixContainer;
