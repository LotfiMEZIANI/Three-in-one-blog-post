import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Hobby } from '../hobby/hobby.model';

@Schema()
export class Person {
  _id: string;

  @Prop()
  name: string;

  @Prop({ type: [Types.ObjectId], ref: Hobby.name })
  hobbies: Types.ObjectId[];
}

export type PersonDocument = Person & Document;

export const PersonSchema = SchemaFactory.createForClass(Person);
