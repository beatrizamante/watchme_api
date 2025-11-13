import { InvalidPersonError } from "../applicationErrors.ts";

type CreatePersonDTO = {
  id?: number;
  user_id: number;
  name: string;
  embedding: Buffer;
};

export class Person {
  public readonly id?: number;
  public readonly user_id: number;
  public readonly name: string;
  public readonly embedding: Buffer;

  constructor(person: CreatePersonDTO) {
    this.id = person.id;

    if (!person.user_id)
      throw new InvalidPersonError({
        message: "Person must be related to an user",
      });
    this.user_id = person.user_id;

    if (!person.name)
      throw new InvalidPersonError({
        message: "Person must have a name",
      });
    this.name = person.name;

    if (!(person.embedding instanceof Buffer))
      throw new InvalidPersonError({
        message: "There must be an embedding related to the person",
      });
    this.embedding = person.embedding;
  }
}
