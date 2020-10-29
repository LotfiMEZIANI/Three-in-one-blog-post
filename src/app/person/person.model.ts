import { Prop, Schema, SchemaFactory  } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Hobby } from "../hobby/hobby.model"

@Schema()
export class Person {
  _id: string;
  @Prop()
  name: string;
  @Prop()
  hobbies: Hobby[];
}

export type PersonDocument = Person & Document;

export const PersonSchema = SchemaFactory.createForClass(Person);
