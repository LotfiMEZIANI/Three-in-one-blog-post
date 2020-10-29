import { Hobby } from '../hobby/hobby.model';
import { Types } from 'mongoose';

export interface CreatePersonInput {
  name: string;
  hobbies: Hobby[];
}

export interface ListPersonInput {
  _id?: string;
  name?: string;
  hobbies?: Types.ObjectId[];
}

export interface UpdatePersonInput {
  _id: string;
  name?: string;
  hobbies?: Types.ObjectId[];
}
