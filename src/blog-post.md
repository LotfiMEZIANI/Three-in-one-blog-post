> Follow me on [Twitter](https://twitter.com/Lotfi_Meziani), happy to take your suggestions and improvements.

I decided to write this blog post after working on a personal project. As I started it, I thought about a way to put in place a solid architecture to create a [GraphQL](https://graphql.org/) API with [NestJs](https://nestjs.com/) and [Mongoose](https://mongoosejs.com/).

> Why GraphQL ?
> // TODO

.

> Why NestJs ?
> // TODO

.

> Why Mongoose ?
> // TODO

# Problematic

There is a question that always comes up when I start to set up the architecture of a project, it is the definition of the data model and how the different layers of the application will consume it. In my case the definition of a data model for the different layers of the application gives me some irritation :sweat::

- The definition of a schema for GraphQL to implement the API endpoint;
- The definition of a schema for mongoose to organize the documents of the database;
- The definition of a data model so that the application can handle the objects;

# Solution

The ideal is to have to define the data model only once and thus it will be used to generate the GrapphQL schema, the mongoDB collection schemas as well as the interfaces used by our NestJs providers. And the magic is that NestJs with it's plugins allows us to do that easily :kissing_smiling_eyes:.

### NestJs plugins

NestJS plugins encapsulate different technologies in [_NestJs modules_](https://docs.nestjs.com/modules#modules) for easy use and integration into the NestJs ecosystem. In my case I used the following two plugins: [`@nestjs/mongoose`](https://github.com/nestjs/mongoose) and [`@nestjs/graphql`](https://github.com/nestjs/graphql)

This two plugins allows us to proceed in two ways:

- **schema-first:** first, define the schema for `mongoose`/`graphQL`, then use it to generate our typescript classes.
- **code-first:** first, define our typescript classes, then use them to generate our schemas `mongoose`/`graphQL`.

In my case, I used the _code-first_ approach, because it allows me to implement a single model (typesscript classes) and use it to generate my schemas for `graphQL` as well as for `mongoose`.

# Implementation

> Here is the final project [source code on GitHub](https://github.com/LotfiMEZIANI/Three-in-one-blog-post).

Okay, I've talked too much. Warm up our fingers to do some magic :mage: !

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
> - **`main.ts`**: the entry point of the NestJS app where we bootstarp it.
> - **`app.module.ts`**: the root module of the NestJS app. It implemente a `controller` `AppController` and a `provider` `AppService`.

To serve the nest server run :

```shell
$ npm start
```

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/prc958e9vl61pu6woqvd.PNG)

For better organization, we will put the app module files in a dedicated folder `src/app/` and update the importe path of `AppModule` in `main.ts`:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/bbb6gofifzj0rsvoi4s5.PNG)

```ts
// maint.ts

import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

### Model

We are going to create an API that manages a list of `Peron` who have a list of `Hobby` for that we will create this two model in `app/` folder:

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

#### Dependencies installation

From the two interfaces `Hobby` and `Person` we will generate the coresponding mongoose schema `HobbySchema` and `PersonSchema`. For that we will install the package `@nestjs/mongoose` with some other dependencies :

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

For better organization we will create two sub modules `PersonModule` and `HobbyModule` each manage the corespending model. We will use `@nestjs/cli` to do that quickly :

```shell
$ cd src\app\
$ nest generate module person
$ nest generate module hobby
```

> The created modules `PersonModule` and `HobbyModule` are automatically imported in `AppModule`.

Now, move each file `person.model.ts` and`hobby.model.ts` into its corresponding modules:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/61j1lfwnxfur18xbgs2z.PNG)

#### Schema generation

We can now start to set up our generation of mongoose schemas. `@nestjs/mongoose` gives us a [_decorators_](https://www.typescriptlang.org/docs/handbook/decorators.html) to annotate our typescript interfaces to indicate how to generate the mongoose schemas. let's add some decorator to our interfaces:

```ts
// person.model.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Hobby } from '../hobby/hobby.model';

@Schema()
export class Person {
  _id: string;

  @Prop()
  name: string;

  @Prop()
  hobbies: Hobby[];
}

export type PersonDocument = Person & Document;

export const PersonSchema = SchemaFactory.createForClass(Person);
```

````ts
// hobby.model.ts

import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HobbyModule } from './hobby.module';

@Schema()
export class Hobby {
  _id: string;

  @Prop()
  name: string;
}

export type HobbyDocument = Hobby & Document;

export const HobbySchema = SchemaFactory.createForClass(HobbyModule);
```ts
> * The `@Prop()` decorator defines a property in the document.
* The `@Schema()` decorator marks a class as a schema definition
* Mongoose documents (ex: `PersonDocument`) represent a one-to-one mapping to documents as stored in MongoDB.

#### CRUD Operations

### GraphQL
// TODO

# Conclusion

As a developer, we combine different bricks of technologies to set up a viable ecosystem :earth_africa: for our project. In a javascript ecosystem, the advantage (or the disadvantage) is the abundance of brick and the possibility of combination. I hope to still have some motivation to be able to write a sequel to this article which explains the integration of this GraphQL api in a monorepo development environment and thus share this data model between several applications and libraries.
````
