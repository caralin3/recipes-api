import Bluebird from 'bluebird';
import { Recipe } from '../models';

export default abstract class Scraper {
  constructor(protected url: string) {}

  abstract scrape(): Bluebird<Recipe | void>;
}

