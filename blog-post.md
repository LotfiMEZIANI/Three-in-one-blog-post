> Follow me on [Twitter](https://twitter.com/Lotfi_Meziani), happy to take your suggestions and improvements.

I decided to write this blog post after working on a personal project. As I started it, I thought about a way to put in place a solid architecture to create a [GraphQL](https://graphql.org/) API with [NestJs](https://nestjs.com/) and [Mongoose](https://mongoosejs.com/).

> Why GraphQL?
>
> - No more Over- and Underfetching ;
> - Rapid Product Iterations on the Frontend ;
> - Insightful Analytics on the Backend ;
> - Benefits of a Schema & Type System ;
>
> -- <cite>[How to GraphQL](https://www.howtographql.com/basics/1-graphql-is-the-better-rest/)</cite>

.

> Why NestJs?
>
> - Nest provides a level of abstraction above these common Node.js frameworks (Express/Fastify) but also exposes their APIs directly to the developer. This allows developers the freedom to use the myriad of third-party modules that are available for the underlying platform.
>
> -- <cite>[Filipe Mazzon](https://www.linkedin.com/pulse/nestjs-why-use-filipe-mazzon/)</cite>

.

> Why Mongoose?
>
> - MongooseJS provides an abstraction layer on top of MongoDB that eliminates the need to use named collections.
> - Models in Mongoose perform the bulk of the work of establishing up default values for document properties and validating data.
> - Functions may be attached to Models in MongooseJS. This allows for seamless incorporation of new functionality.
> - Queries use function chaining rather than embedded mnemonics which result in code that is more flexible and readable, therefore more maintainable as well.
>
> -- <cite>[Jim Medlock](https://medium.com/chingu/an-overview-of-mongodb-mongoose-b980858a8994#:~:text=The%20three%20main%20advantages%20of,document%20properties%20and%20validating%20data.)</cite>

<hr />

# Problematic

There is a question that always comes up when I start to set up the architecture of a project, it is the definition of the data model and how the different layers of the application will consume it. In my case, the definition of a data model for the different layers of the application gives me some irritation :sweat::

- The definition of a schema for GraphQL to implement the API endpoint;
- The definition of a schema for Mongoose to organize the documents of the database;
- The definition of a data model so that the application map objects;

<hr />

# Solution

The ideal is to have to define the data model only once and thus it will be used to generate the GraphQL schema, the MongoDB collection schemas as well as the classes used by NestJs providers. And the magic is that NestJs with its plugins allow us to do it easily :kissing_smiling_eyes:.

### NestJs plugins

NestJS plugins encapsulate different technologies in [_NestJs modules_](https://docs.nestjs.com/modules#modules) for easy use and integration into the NestJs ecosystem. In this case, we will use the following two plugins: [`@nestjs/mongoose`](https://github.com/nestjs/mongoose) and [`@nestjs/graphql`](https://github.com/nestjs/graphql)

These two plugins allow us to proceed in two ways:

- **schema-first:** first, define the schemas for Mongoose and for GraphQL, then use it to generate our typescript classes.
- **code-first:** first, define our typescript classes, then use them to generate our schemas Mongoose/GraphQL.

I used the _code-first_ approach because it allows me to implement a single model (typescript classes) and use it to generate my schemas for GraphQL as well as for Mongoose.

<hr />

# Implementation

> Here is the final project [source code on GitHub](https://github.com/LotfiMEZIANI/Three-in-one-blog-post).

Okay, I've talked too much. Warm-up our fingers to do some magic :mage:!

### NestJS

First, create our NestJs project using [`@nestjs/cli`](https://www.npmjs.com/package/@nestjs/cli). We will call it `three-in-one-project`:

```shell
$ npm i -g @nestjs/cli
$ nest new three-in-one-project
```

This will initiate our NestJs project:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/7o7xtxbgy4motfb8t85b.PNG)

> What interests us here is the content of the `src/` folder :
>
> - **`main.ts`**: the entry point of the NestJS app where we bootstrap it.
> - **`app.module.ts`**: the root module of the NestJS app. It implemente a `controller` `AppController` and a `provider` `AppService`.

to serve the nest server run :

```shell
$ npm start
```

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/prc958e9vl61pu6woqvd.PNG)

For better organization, we will put the `AppModule` files in a dedicated folder `src/app/` and update the import path of `AppModule` in `main.ts`:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/bbb6gofifzj0rsvoi4s5.PNG)

> Don't forget to update the import path of `AppModule` in `main.ts`

### Model

We are going to create an API that manages a list of `Peron` who have a list of `Hobby` for that we will create these two model in `app/` folder:

```ts
// person.model.ts

export class Person {
  _id: string;
  name: string;
  hobbies: Hobby[];
}
```

```ts
// hobby.model.ts

export class Hobby {
  _id: string;
  name: string;
}
```

### Mongoose

#### Installing dependencies

From the two classes `Hobby` and `Person` we will generate the corresponding mongoose schema `HobbySchema` and `PersonSchema`. For that we will install the package `@nestjs/mongoose` with some other dependencies :

```shell
$ npm i @nestjs/mongoose mongoose
$ npm i --save-dev @types/mongoose
```

#### Connection to MongoDB

To connecte our backend to mongoDB data base, we will import in `AppModule` the `MongooseModule` :

```ts
// app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  // "mongodb://localhost:27017/three-in-one-db" is the connection string to the project db
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/three-in-one-db'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

For better organization we will create two sub-modules `PersonModule` and `HobbyModule` each manage the corresponding model. We will use `@nestjs/cli` to do that quickly :

```shell
$ cd src\app\
$ nest generate module person
$ nest generate module hobby
```

> The created modules `PersonModule` and `HobbyModule` are automatically imported in `AppModule`.

Now, move each file `person.model.ts` and `hobby.model.ts` into its corresponding modules :

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/61j1lfwnxfur18xbgs2z.PNG)

#### Schema generation

We can now start to set up the generation of mongoose schemas. `@nestjs/mongoose` gives us a [_decorators_](https://www.typescriptlang.org/docs/handbook/decorators.html) to annotate our typescript classes to indicate how to generate the mongoose schemas. let's add some decorator to our classes:

```ts
// person.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Hobby } from '../hobby/hobby.model';

@Schema()
export class Person {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  hobbies: Hobby[];
}

export type PersonDocument = Person & Document;

export const PersonSchema = SchemaFactory.createForClass(Person);
```

```ts
// hobby.model.ts

import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Hobby {
  _id: Types.ObjectId;

  @Prop()
  name: string;
}

export type HobbyDocument = Hobby & Document;

export const HobbySchema = SchemaFactory.createForClass(Hobby);
```

> - The `@Prop()` decorator defines a property in the document.

- The `@Schema()` decorator marks a class as a schema definition
- Mongoose documents (ex: `PersonDocument`) represent a one-to-one mapping to documents as stored in MongoDB.
- `Types.ObjectId` is a mongoose type typically used for unique identifiers

And finally, we import the model to MongooseModule in our two modules :

```ts
// person.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Person, PersonSchema } from './person.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }]),
  ],
})
export class PersonModule {}
```

```ts
// hobby.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Hobby, HobbySchema } from './hobby.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hobby.name, schema: HobbySchema }]),
  ],
})
export class HobbyModule {}
```

#### CRUD Operations

We will create the layer for our two modules witch implement CRUD operations. For each module, create a [_NestJS service_](https://docs.nestjs.com/providers#services) who implements that. To create the two services, execute the following commands :

```shell
$ cd src\app\person\
$ nest generate service person --flat
$ cd ..\hobby\
$ nest generate service hobby --flat
```

> we use `--flat` to not generate a folder for the service.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/sz36pvhswvh5u2h4re9u.PNG)

Update services to add CRUD methods and their inputs classes :

```ts
// person.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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

  getById(_id: Types.ObjectId) {
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

  delete(_id: Types.ObjectId) {
    return this.personModel.findByIdAndDelete(_id).exec();
  }
}
```

```ts
// person.inputs.ts

import { Types } from 'mongoose';
import { Hobby } from '../hobby/hobby.model';

export class CreatePersonInput {
  name: string;
  hobbies: Hobby[];
}

export class ListPersonInput {
  _id?: Types.ObjectId;
  name?: string;
  hobbies?: Hobby[];
}

export class UpdatePersonInput {
  _id: Types.ObjectId;
  name?: string;
  hobbies?: Hobby[];
}
```

```ts
// hobby.service.ts

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
```

```ts
// hobby.inputs.ts

export class CreateHobbyInput {
  name: string;
}

export class ListHobbyInput {
  _id?: Types.ObjectId;
  name?: string;
}

export class UpdateHobbyInput {
  _id: Types.ObjectId;
  name?: string;
}
```

Note that the attribute `hobbies` of `Hobby` class is an array of reference to `Hobby` object. So let's make some adjustment:

```ts
// person.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Hobby } from '../hobby/hobby.model';

@Schema()
export class Person {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ type: [Types.ObjectId], ref: Hobby.name })
  hobbies: Types.ObjectId[];
}

export type PersonDocument = Person & Document;

export const PersonSchema = SchemaFactory.createForClass(Person);
```

```ts
// person.inputs.ts

import { Hobby } from '../hobby/hobby.model';
import { Types } from 'mongoose';

export class CreatePersonInput {
  name: string;
  hobbies: Types.ObjectId[];
}

export class ListPersonInput {
  _id?: Types.ObjectId;
  name?: string;
  hobbies?: Types.ObjectId[];
}

export class UpdatePersonInput {
  _id: Types.ObjectId;
  name?: string;
  hobbies?: Types.ObjectId[];
}
```

### GraphQL

We are almost done, we just have to implement the graphQL layer.

#### Dependencies installation

```shell
$ npm i @nestjs/graphql graphql-tools graphql apollo-server-express
```

#### Schema generation

As for the mongoose, we will use [`decorators`](https://www.typescriptlang.org/docs/handbook/decorators.html) from [`@nestjs/graphql`](https://github.com/nestjs/graphql) to annotate our typescript classes to indicate how to generate the graphQL schemas:

```ts
// person.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';

import { Hobby } from '../hobby/hobby.model';

@ObjectType()
@Schema()
export class Person {
  @Field(() => String)
  _id: Types.ObjectId;

  @Field(() => String)
  @Prop()
  name: string;

  @Field(() => [String])
  @Prop({ type: [Types.ObjectId], ref: Hobby.name })
  hobbies: Types.ObjectId[];
}

export type PersonDocument = Person & Document;

export const PersonSchema = SchemaFactory.createForClass(Person);
```

```ts
// hobby.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Document } from 'mongoose';

@ObjectType()
@Schema()
export class Hobby {
  @Field(() => String)
  _id: Types.ObjectId;

  @Field(() => String)
  @Prop()
  name: string;
}

export type HobbyDocument = Hobby & Document;

export const HobbySchema = SchemaFactory.createForClass(Hobby);
```

> For more information about `@nestjs/graphql` decorators `ObjectType` and `Field`: [official doc](https://docs.nestjs.com/graphql/resolvers)

#### Resolvers

To define our graphQL `query`, `mutation`, and `resolvers` we will create a `NestJS resolver`. we can use the NestJs CLI to do that:

```shell
$ cd src\app\person\
$ nest generate resolver person --flat
$ cd ..\hobby\
$ nest generate resolver hobby --flat
```

Then, update the generated files :

```ts
// person.resolver.ts

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
```

```ts
// hobby.resolver.ts

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Types } from 'mongoose';

import { Hobby } from './hobby.model';
import { HobbyService } from './hobby.service';
import {
  CreateHobbyInput,
  ListHobbyInput,
  UpdateHobbyInput,
} from './hobby.inputs';

@Resolver(() => Hobby)
export class HobbyResolver {
  constructor(private hobbyService: HobbyService) {}

  @Query(() => Hobby)
  async hobby(@Args('_id', { type: () => String }) _id: Types.ObjectId) {
    return this.hobbyService.getById(_id);
  }

  @Query(() => [Hobby])
  async hobbies(@Args('filters', { nullable: true }) filters?: ListHobbyInput) {
    return this.hobbyService.list(filters);
  }

  @Mutation(() => Hobby)
  async createHobby(@Args('payload') payload: CreateHobbyInput) {
    return this.hobbyService.create(payload);
  }

  @Mutation(() => Hobby)
  async updateHobby(@Args('payload') payload: UpdateHobbyInput) {
    return this.hobbyService.update(payload);
  }

  @Mutation(() => Hobby)
  async deleteHobby(@Args('_id', { type: () => String }) _id: Types.ObjectId) {
    return this.hobbyService.delete(_id);
  }
}
```

> For more information about `@nestjs/graphql` decorators `Mutation`, `Resolver`,and `Query`: [official doc](https://docs.nestjs.com/graphql/resolvers)

let's add some decorators to inputs classes so that GraphQl recognizes them :

```ts
// person.inputs.ts

import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

import { Hobby } from '../hobby/hobby.model';

@InputType()
export class CreatePersonInput {
  @Field(() => String)
  name: string;

  @Field(() => [String])
  hobbies: Types.ObjectId[];
}

@InputType()
export class ListPersonInput {
  @Field(() => String, { nullable: true })
  _id?: Types.ObjectId;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => [String], { nullable: true })
  hobbies?: Types.ObjectId[];
}

@InputType()
export class UpdatePersonInput {
  @Field(() => String)
  _id: Types.ObjectId;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => [String], { nullable: true })
  hobbies?: Types.ObjectId[];
}
```

```ts
// hobby.inputs.ts

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
```

#### Import GraphQLModule

Finally, import the `GraphQLModule` in `AppModule`:

```ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

import { PersonModule } from './person/person.module';
import { HobbyModule } from './hobby/hobby.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/three-in-one-db'),
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      debug: false,
    }),
    PersonModule,
    HobbyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

> - `autoSchemaFile` property value is the path where your automatically generated schema will be created

- `sortSchema` the types in the generated schema will be in the order they are defined in the included modules. To sort the schema lexicographically turn this attribute to `true`
- `playground` to activate [`graqh-playground`](https://github.com/graphql/graphql-playground)
- `debug` to turn on/off debug mode

#### GraphQL playground

> The playground is a graphical, interactive, in-browser GraphQL IDE, available by default on the same URL as the GraphQL server itself. To access the playground, you need a basic GraphQL server configured and running.
> -- <cite>[NestJs Doc](https://docs.nestjs.com/graphql/quick-start#graphql-playground)</cite>

We have already activated playground in the previous step, once the server is started (`yarn start`), we can access it via the following URL: [http://localhost:3000/graphql](http://localhost:3000/graphql) :

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/t2r5if8q4wun4ywcp0y8.PNG)

### Populate & ResolveField

Mongoose has a powerful method called `populate()`, which lets you reference documents in other collections.

> Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s). We may populate a single document, multiple documents, a plain object, multiple plain objects, or all objects returned from a query. Let's look at some examples.
> -- <cite>[Mongoose Doc](https://mongoosejs.com/docs/populate.html)</cite>

We can use Mongoose `populate` to resolve `hobbies` field of `Person` :

```ts
// person.resolver.ts

import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Types } from 'mongoose';

import { Person, PersonDocument } from './person.model';
import { PersonService } from './person.service';
import {
  CreatePersonInput,
  ListPersonInput,
  UpdatePersonInput,
} from './person.inputs';
import { Hobby } from '../hobby/hobby.model';

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

  @ResolveField()
  async hobbies(
    @Parent() person: PersonDocument,
    @Args('populate') populate: boolean,
  ) {
    if (populate)
      await person
        .populate({ path: 'hobbies', model: Hobby.name })
        .execPopulate();

    return person.hobbies;
  }
}
```

```ts
// person.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';

import { Hobby } from '../hobby/hobby.model';

@ObjectType()
@Schema()
export class Person {
  @Field(() => String)
  _id: Types.ObjectId;

  @Field(() => String)
  @Prop()
  name: string;

  @Field(() => [Hobby])
  @Prop({ type: [Types.ObjectId], ref: Hobby.name })
  hobbies: Types.ObjectId[] | Hobby[];
}

export type PersonDocument = Person & Document;

export const PersonSchema = SchemaFactory.createForClass(Person);
```

This allows us to do request `Person` in this way:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/9qv3xyoyhwujbokza31l.PNG)

<hr />

# Conclusion

As a developer, we combine different bricks of technologies to set up a viable ecosystem :earth_africa: for our project. In a javascript ecosystem, the advantage (or the disadvantage) is the abundance of brick and the possibility of combination. I hope to still have some motivation to be able to write a sequel to this article which explains the integration of this GraphQL API in a monorepo development environment and thus shares this data model between several applications and libraries.
