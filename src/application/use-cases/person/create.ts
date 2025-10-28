import { Person } from "../../../domain/Person.ts";
import { PersonInterface } from "../../../domain/PersonRepository.ts";
import { PersonSerializer } from "../../../interface/serializer/serializePerson.ts";

type Dependencies = {
  personRepository: PersonInterface;
};

type CreatePersonParams = {
  person: Person;
};

export const makeCreatePerson =
  ({ personRepository }: Dependencies) =>
  async ({ person }: CreatePersonParams) => {
    const validPerson = new Person(person);

    const newPerson = await personRepository.create(validPerson);
    return PersonSerializer.serialize(newPerson);
  };

export type CreatePerson = ReturnType<typeof makeCreatePerson>;
