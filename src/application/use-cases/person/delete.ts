import { PersonInterface } from "../../../domain/PersonRepository.ts";
import { findPerson } from "../../queries/findPerson.ts";

type Dependencies = {
  personRepository: PersonInterface;
};

type DeletePersonParams = {
  personId: number;
  userId: number;
};

export const makeDeletePerson =
  ({ personRepository }: Dependencies) =>
  async ({ personId, userId }: DeletePersonParams) => {
    const validPerson = await findPerson(personId, userId);

    return await personRepository.delete(validPerson);
  };

export type DeletePerson = ReturnType<typeof makeDeletePerson>;
