import cheerio from 'cheerio';
import rp from 'request-promise';
import { Recipe } from '../models';
import Scraper from './scraper';

interface RecipeTimes {
  cookTime: number;
  prepTime: number;
  totalTime: number;
}

export default class AllRecipesScraper extends Scraper {
  constructor (url: string) {
    super(url);
  }

  private getTimes(text: string) {
    const raw = text.trim().split('\n');
    const obj: RecipeTimes = {} as RecipeTimes;
    raw.forEach(time => {
      if (time.trim() !== '') {
        const times = time.trim().split(' ');
        if (times[0].includes('Prep')) {
          if (times[times.length - 1] === 'm') {
            obj.prepTime = parseInt(times[0].slice(4), 10);
          }
        } else if (times[0].includes('Cook')) {
          if (times[times.length - 1] === 'm') {
            obj.cookTime = parseInt(times[0].slice(4), 10);
          }
        } else if (times[1].includes('In')) {
          let total = 0;
          if (times[times.length - 1] === 'm') {
            let min = parseInt(times[times.length - 2].slice(2), 10);
            if (isNaN(min)) {
              min = parseInt(times[times.length - 2], 10);
            }
            if (times[2] === 'h') {
              const hour = parseInt(times[1].slice(2), 10);
              if (hour !== 0 || !isNaN(hour)) {
                total = Math.ceil(60 * hour);
              }
              total += min;
            } else {
              total = min;
            }
          }
          obj.totalTime = total;
        }
      }
    });
    return obj;
  }

  scrape() {
    const data: Recipe = {
      src: 'AllRecipes',
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
      .then(($: any) => {
        // Get calories
        data.calories = parseInt($('.calorie-count').text().split(' ')[0], 10);

        // Get cooking times
        const times: RecipeTimes = this.getTimes($('.prepTime').text());
        data.cookTime = times.cookTime || 0;
        data.prepTime = times.prepTime || 0;
        data.totalTime = times.totalTime || 0;

        // Get directions
        const directions: string[] = [];
        $('.step').each((i: number, elem: HTMLElement) => {
          if ($(elem).text().trim()) {
            directions.push($(elem).text().trim());
          }
        });
        data.directions = directions;

        // Get ingredients
        const ingredients: string[] = [];
        $('.recipe-ingred_txt').each((i: number, elem: HTMLElement) => {
          if ($(elem).text().trim() && $(elem).text().trim() !== 'Add all ingredients to list') {
            ingredients.push($(elem).text().trim());
          }
        });
        data.ingredients = ingredients;
        
        // Get notes
        const notes: string[] = [];
        $('.recipe-footnotes').find('li').each((i: number, elem: HTMLElement) => {
          if (i !== 0) {
            notes.push($(elem).text().trim());
          }
        });
        data.notes = notes;

        // Get Servings
        const servings = parseInt($('#metaRecipeServings').attr('content'), 10);
        data.servings = servings || 0;

        // Get title
        data.title = $('#recipe-main-content').text();

        return data;
      })
      .catch((err: Error) => {
        console.log(err);
      });
  }
}
