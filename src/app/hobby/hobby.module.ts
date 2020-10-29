import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Hobby, HobbySchema } from './hobby.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hobby.name, schema: HobbySchema }]),
  ],
})
export class HobbyModule {}
