import { Person } from "../../domain/Person.ts";
export const PersonSerializer = {
  serialize(person: Person) {
    return {
      id: person.id,
      name: person.name,
      user_id: person.user_id,
      embedding: person.embedding,
    };
  },
  serializeList(people: Person[]) {
    return people.map(this.serialize);
  },
};
