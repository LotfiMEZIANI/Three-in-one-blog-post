import { Types } from 'mongoose';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateHobbyInput {
  @Field(() => String)
  name: string;
}

@InputType()
export class ListHobbyInput {
  @Field(() => String, { nullable: true })
  _id?: Types.ObjectId;

  @Field(() => String, { nullable: true })
  name?: string;
}

@InputType()
export class UpdateHobbyInput {
  @Field(() => String)
  _id: Types.ObjectId;

  @Field(() => String, { nullable: true })
  name?: string;
}
