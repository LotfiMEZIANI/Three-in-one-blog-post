import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Hobby, HobbyDocument } from './hobby.model';
import {
  CreateHobbyInput,
  ListHobbyInput,
  UpdateHobbyInput,
} from './hobby.inputs';

@Injectable()
export class HobbyService {
  constructor(
    @InjectModel(Hobby.name) private personModel: Model<HobbyDocument>,
  ) {}

  create(payload: CreateHobbyInput) {
    const createdHobby = new this.personModel(payload);
    return createdHobby.save();
  }

  getById(_id: string) {
    return this.personModel.findById(_id).exec();
  }

  list(filters: ListHobbyInput) {
    return this.personModel.find({ ...filters }).exec();
  }

  update(payload: UpdateHobbyInput) {
    return this.personModel
      .findByIdAndUpdate(payload._id, payload, { new: true })
      .exec();
  }

  delete(_id: string) {
    return this.personModel.findByIdAndDelete(_id).exec();
  }
}
