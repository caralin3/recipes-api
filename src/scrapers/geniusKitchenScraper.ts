import cheerio from 'cheerio';
import rp from 'request-promise';
import { Recipe } from '../models';
import Scraper from './scraper';

export default class GeniusKitchenScraper extends Scraper {
  constructor (url: string) {
    super(url);
  }

  private getTotalTime(text: string) {
    const raw = text.trim().split('\n');
    if (raw.length > 1) {
      const hours = raw[raw.length - 4].trim();
      const minutes = raw[raw.length - 1].trim();
      let total = 0;
      if (hours && !isNaN(parseInt(hours, 10))) {
        const hour = parseInt(hours.match(/\d+/g)[0], 10);
        const mins = parseInt(minutes.match(/\d+/g)[0], 10);
        total = Math.ceil(60 * hour);
        total += mins;
      } else {
        const num = parseInt(minutes.match(/\d+/g)[0], 10);
        const unit = minutes.match(/[a-zA-Z]+/g)[0];
        if (unit === 'hrs') {
          total = Math.ceil(60 * num);
        } else {
          total = num;
        }
      }
      return total;
    }
    return 0;
  }

  scrape() {
    const data: Recipe = {
      cookTime: 0,
      notes: [],
      prepTime: 0,
      src: 'Genius Kitchen',
      url: this.url,
    } as Recipe;
    const options: rp.OptionsWithUri = {
      uri: this.url,
      transform: (body: any) => {
        return cheerio.load(body);
      }
    };
    return rp(options)
      .then(($) => {
        // Get calories
        data.calories = parseInt($('.calories').text(), 10) || 0;

        // Get cooking times
        data.totalTime = this.getTotalTime($('.time').text()) || 0;

        // Get directions
        const directions: string[] = [];
        $('.directions-inner').find('li').each((i: number, elem: HTMLElement) => {
          if ($(elem).text().trim()) {
            directions.push($(elem).text().trim());
          }
        });
        directions.pop();
        data.directions = directions;

        // Get ingredients
        const ingredients: string[] = [];
        $('.ingredient-list').find('li').each((i: number, elem: HTMLElement) => {
          if ($(elem).text().trim()) {
            ingredients.push($(elem).text().trim());
          }
        });
        data.ingredients = ingredients;
        
        // Get Yield
        const counts: any = {};
        const field = $('.count').parent().parent().attr('class');
        if (field) {
          counts[field.toLowerCase().trim()] = parseInt($('.count').text(), 10);
        }
        data.servings = counts['servings'] || 0;
        data.yield = counts['yield'] || 0;

        // Get title
        data.title = $('.recipe-header').find('h1').text();


        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
