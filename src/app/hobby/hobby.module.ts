import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Hobby, HobbySchema } from './hobby.model';
import { HobbyService } from './hobby.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hobby.name, schema: HobbySchema }]),
  ],
  providers: [HobbyService],
})
export class HobbyModule {}
