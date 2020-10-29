export interface CreateHobbyInput {
  name: string;
}

export interface ListHobbyInput {
  _id?: string;
  name?: string;
}

export interface UpdateHobbyInput {
  _id: string;
  name?: string;
}
