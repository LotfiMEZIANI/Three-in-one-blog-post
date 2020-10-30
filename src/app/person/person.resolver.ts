import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';

import { Person } from './person.model';
import { PersonService } from './person.service';
import {
  CreatePersonInput,
  ListPersonInput,
  UpdatePersonInput,
} from './person.inputs';

@Resolver(() => Person)
export class PersonResolver {
  constructor(private personService: PersonService) {}

  @Query(() => Person)
  async person(@Args('_id', { type: () => String }) _id: Types.ObjectId) {
    return this.personService.getById(_id);
  }

  @Query(() => [Person])
  async persons(
    @Args('filters', { nullable: true }) filters?: ListPersonInput,
  ) {
    return this.personService.list(filters);
  }

  @Mutation(() => Person)
  async createPerson(@Args('payload') payload: CreatePersonInput) {
    return this.personService.create(payload);
  }

  @Mutation(() => Person)
  async updatePerson(@Args('payload') payload: UpdatePersonInput) {
    return this.personService.update(payload);
  }

  @Mutation(() => Person)
  async deletePerson(@Args('_id', { type: () => String }) _id: Types.ObjectId) {
    return this.personService.delete(_id);
  }
}
