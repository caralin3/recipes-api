import cheerio from 'cheerio';
import rp from 'request-promise';
import { Recipe } from '../models';

export default class GeniusKitchenScraper {
  private url: string;

  constructor (url: string) {
    this.url = url;
  }

  getTotalTime(text: string) {
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
    const data: Recipe = {} as Recipe;
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
        data.cookTime = 0;
        data.prepTime = 0;
        data.totalTime = this.getTotalTime($('.time').text()) || 0;

        // Get directions
        const directions: string[] = [];
        $('.directions-inner').find('li').each((i: any, elem: any) => {
          if ($(elem).text().trim()) {
            directions.push($(elem).text().trim());
          }
        });
        directions.pop();
        data.directions = directions;

        // Get ingredients
        const ingredients: string[] = [];
        $('.ingredient-list').find('li').each((i: any, elem: any) => {
          if ($(elem).text().trim()) {
            ingredients.push($(elem).text().trim());
          }
        });
        data.ingredients = ingredients;
        
        // Get notes
        data.notes = [];

        // Get Yield
        const counts: any = {};
        const field = $('.count').parent().parent().attr('class');
        if (field) {
          counts[field.toLowerCase().trim()] = parseInt($('.count').text(), 10);
        }
        data.servings = counts['servings'] || 0;

        data.src = 'Genius Kitchen';

        // Get title
        data.title = $('.recipe-header').find('h1').text();

        data.url = this.url;
        data.yield = counts['yield'] || 0;

        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
