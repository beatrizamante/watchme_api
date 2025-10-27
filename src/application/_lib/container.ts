import { asClass, asFunction, createContainer } from "awilix";
import { PersonInterface } from "../../domain/PersonRepository.ts";
import { ProfilePictureInterface } from "../../domain/ProfilePictureRepository.ts";
import { UserInterface } from "../../domain/UserRepository.ts";
import { VideoInterface } from "../../domain/VideoRepository.ts";
import { PersonRepository } from "../../infrastructure/database/repositories/PersonRepository.ts";
import { ProfilePictureRepository } from "../../infrastructure/database/repositories/ProfilePictureRepository.ts";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository.ts";
import { VideoRepository } from "../../infrastructure/database/repositories/VideoRepository.ts";
import { CreatePerson, makeCreatePerson } from "../use-cases/person/create.ts";
import { DeletePerson, makeDeletePerson } from "../use-cases/person/delete.ts";
import { CreateUser, makeCreateUser } from "../use-cases/user/create.ts";
import {
  DeletePicture,
  makeDeletePicture,
} from "../use-cases/user/profile-picture/delete.ts";
import {
  makeUpsertPicture,
  UpsertPicture,
} from "../use-cases/user/profile-picture/upsert.ts";
import { makeUpdateUser, UpdateUser } from "../use-cases/user/update.ts";
import { CreateVideo, makeCreateVideo } from "../use-cases/video/create.ts";
import { DeleteVideo, makeDeleteVideo } from "../use-cases/video/delete.ts";

export type Container = {
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
