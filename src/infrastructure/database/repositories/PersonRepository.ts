import { DatabaseError } from "../../../domain/applicationErrors.ts";
import { PersonInterface } from "../../../domain/PersonRepository.ts";
import { Person } from "../../../domain/person/Person.ts";
import { PersonModel } from "../models/PersonModel.ts";

export class PersonRepository implements PersonInterface {
  async create(person: Person): Promise<Person> {
    try {
      const createdPerson = await PersonModel.query().insertAndFetch(person);

      return createdPerson;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error creating the person: ${message}`,
      });
    }
  }

  async delete(person: Person): Promise<number> {
    try {
      // biome-ignore lint/style/noNonNullAssertion: "There will always be an id to delete"
      const deletedPerson = await PersonModel.query().deleteById(person.id!);

      return deletedPerson;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";

      throw new DatabaseError({
        message: `There was an error deleting the person: ${message}`,
      });
    }
  }
}
