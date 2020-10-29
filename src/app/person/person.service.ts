import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Person, PersonDocument } from './person.model';
import {
  CreatePersonInput,
  ListPersonInput,
  UpdatePersonInput,
} from './person.inputs';

@Injectable()
export class PersonService {
  constructor(
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
  ) {}

  create(payload: CreatePersonInput) {
    const createdPerson = new this.personModel(payload);
    return createdPerson.save();
  }

  getById(_id: string) {
    return this.personModel.findById(_id).exec();
  }

  list(filters: ListPersonInput) {
    return this.personModel.find({ ...filters }).exec();
  }

  update(payload: UpdatePersonInput) {
    return this.personModel
      .findByIdAndUpdate(payload._id, payload, { new: true })
      .exec();
  }

  delete(_id: string) {
    return this.personModel.findByIdAndDelete(_id).exec();
  }
}
