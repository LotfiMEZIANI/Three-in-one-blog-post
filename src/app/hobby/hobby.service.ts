import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Hobby, HobbyDocument } from './hobby.model';
import {
  CreateHobbyInput,
  ListHobbyInput,
  UpdateHobbyInput,
} from './hobby.inputs';

@Injectable()
export class HobbyService {
  constructor(
    @InjectModel(Hobby.name) private hobbyModel: Model<HobbyDocument>,
  ) {}

  create(payload: CreateHobbyInput) {
    const createdHobby = new this.hobbyModel(payload);
    return createdHobby.save();
  }

  getById(_id: Types.ObjectId) {
    return this.hobbyModel.findById(_id).exec();
  }

  list(filters: ListHobbyInput) {
    return this.hobbyModel.find({ ...filters }).exec();
  }

  update(payload: UpdateHobbyInput) {
    return this.hobbyModel
      .findByIdAndUpdate(payload._id, payload, { new: true })
      .exec();
  }

  delete(_id: Types.ObjectId) {
    return this.hobbyModel.findByIdAndDelete(_id).exec();
  }
}
