import cheerio from 'cheerio';
import rp from 'request-promise';
import { Recipe } from '../models';

export default class FoodAndWineScraper {
  private url: string;

  constructor (url: string) {
    this.url = url;
  }

  getTotalTime(text: string) {
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
        data.calories = 0;

        // Get cooking times
        const time = $('.recipe-meta-item-header').filter((i: any, elem: any) => $(elem).text().includes('Total Time'));
        data.cookTime = 0;
        data.prepTime = 0;
        data.totalTime = this.getTotalTime(time.next().text().trim()) || 0;

        // Get directions
        const directions: string[] = [];
        $('.step').find('p').each((i: any, elem: any) => {
          directions[i] = $(elem).text().trim();
        });
        data.directions = directions;

        // Get ingredients
        const ingredients: string[] = [];
        $('.ingredients').find('li').each((i: any, elem: any) => {
          ingredients[i] =  $(elem).text().trim();
        });
        data.ingredients = ingredients;
        
        // Get notes
        data.notes = [];

        // Get Yield
        const serves = $('.recipe-meta-item-body').filter((i: any, elem: any) => $(elem).text().includes('Serves'));
        const servings = parseInt(serves.text().match(/\d+/g)[0], 10);
        data.servings = servings || 0;

        data.src = 'Food & Wine';

        // Get title
        data.title = $('.recipe-header').find('h1').text();

        data.url = this.url;
        data.yield = 0;

        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
