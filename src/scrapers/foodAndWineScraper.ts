import cheerio from 'cheerio';
import rp from 'request-promise';
import { Recipe } from '../models';
import Scraper from './scraper';

export default class FoodAndWineScraper extends Scraper {
  constructor (url: string) {
    super(url);
  }

  private getTotalTime(text: string) {
    const raw = text.trim().split(' ');
    const unit1 = raw[1];
    let total = 0;
    if (unit1 === 'HR') {
      const hour = parseInt(raw[0], 10);
      total = 60 * hour;
      if (raw.length === 4) {
        const unit2 = raw[3];
        if (unit2 === 'MIN') {
          total += parseInt(raw[2], 10);
        }
      }
    } else {
      total = parseInt(raw[0], 10);
    }
    return total;
  }

  scrape() {
    const data: Recipe = {
      calories: 0,
      cookTime: 0,
      notes: [],
      prepTime: 0,
      src: 'Food & Wine',
      url: this.url,
      yield: 0,
    } as Recipe;
    const options: rp.OptionsWithUri = {
      uri: this.url,
      transform: (body: any) => {
        return cheerio.load(body);
      }
    };
    return rp(options)
      .then(($) => {
        // Get cooking times
        const time = $('.recipe-meta-item-header').filter((i: number, elem: HTMLElement) => $(elem).text().includes('Total Time'));
        data.totalTime = this.getTotalTime(time.next().text().trim()) || 0;

        // Get directions
        const directions: string[] = [];
        $('.step').find('p').each((i: number, elem: HTMLElement) => {
          directions[i] = $(elem).text().trim();
        });
        data.directions = directions;

        // Get ingredients
        const ingredients: string[] = [];
        $('.ingredients').find('li').each((i: number, elem: HTMLElement) => {
          ingredients[i] =  $(elem).text().trim();
        });
        data.ingredients = ingredients;

        // Get Servings
        const serves = $('.recipe-meta-item-body').filter((i: number, elem: HTMLElement) => $(elem).text().includes('Serves'));
        const servings = parseInt(serves.text().match(/\d+/g)[0], 10);
        data.servings = servings || 0;

        // Get title
        data.title = $('.recipe-header').find('h1').text();

        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
