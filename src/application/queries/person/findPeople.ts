import { InvalidUserError } from "../../../domain/applicationErrors.ts";
import { PersonModel } from "../../../infrastructure/database/models/PersonModel.ts";
import { UserModel } from "../../../infrastructure/database/models/UserModel.ts";
import { PersonSerializer } from "../../../interface/serializer/serializePerson.ts";

export const findPeople = async (user_id: number) => {
  const user = await UserModel.query().findById(user_id);

  if (!user)
    throw new InvalidUserError({
      message: "This user cannot access this resource",
    });

  if (user.isAdmin()) {
    return PersonSerializer.serializeList(await PersonModel.query().select());
  }

  return PersonSerializer.serializeList(
    await PersonModel.query().where("user_id", user_id)
  );
};
