import { Person } from "./Person.ts";

export interface PersonInterface {
  create: (person: Person) => Promise<Person>;
  delete: (person: Person) => Promise<number>;
}
