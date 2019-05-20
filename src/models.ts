import * as t from 'io-ts';

export interface EndpointResponse {
  data?: Recipe;
  message?: string;
  status: 'success' | 'error';
}

export const Recipe = t.interface({
  calories: t.number,
  cookTime: t.number,
  prepTime: t.number,
  directions: t.array(t.string),
  ingredients: t.array(t.string),
  notes: t.array(t.string),
  servings: t.number,
  src: t.string,
  title: t.string,
  totalTime: t.number,
  url: t.string,
  yield: t.number,
});

export interface Recipe extends t.TypeOf<typeof Recipe> {}
