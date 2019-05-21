import cheerio from 'cheerio';
import rp from 'request-promise';
import { Recipe } from '../models';
import Scraper from './scraper';

export default class FoodNetworkScraper extends Scraper {
  constructor (url: string) {
    super(url);
  }

  private getTime(text: string) {
    const raw = text.trim().split(' ');
    const unit1 = raw[1];
    let total = 0;
    if (unit1 === 'hr') {
      const hour = parseInt(raw[0], 10);
      total = 60 * hour;
      if (raw.length === 4) {
        const unit2 = raw[3];
        if (unit2 === 'min') {
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
      servings: 0,
      src: 'Food Network',
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
        // Get cooking times
        const prep = $('.o-RecipeInfo__m-Time').find('li')
          .filter((i: number, elem: HTMLElement) => $(elem).text().includes('Prep'));
        const cook = $('.o-RecipeInfo__m-Time').find('li')
          .filter((i: number, elem: HTMLElement) => $(elem).text().includes('Cook'));
        data.cookTime = this.getTime(cook.text().trim().split('\n')[1].trim());
        data.prepTime = this.getTime(prep.text().trim().split('\n')[1].trim());
        data.totalTime = this.getTime($('.m-RecipeInfo__a-Description--Total').text());

        // Get directions
        const directions: string[] = [];
        $('.o-Method__m-Step').each((i: number, elem: HTMLElement) => {
          directions[i] = $(elem).text().trim();
        });
        data.directions = directions;

        // Get ingredients
        const ingredients: string[] = [];
        $('.o-Ingredients__a-Ingredient').each((i: number, elem: HTMLElement) => {
          ingredients[i] =  $(elem).text().trim();
        });
        data.ingredients = ingredients;
        
        // Get notes
        const notes: string[] = [];
        $('.o-ChefNotes__a-Description').each((i: number, elem: HTMLElement) => {
          notes[i] =  $(elem).text().trim();
        });
        data.notes = notes;

        // Get Yield
        const servings = $('.o-RecipeInfo__m-Yield').find('.o-RecipeInfo__a-Description').text();
        const yields = parseInt(servings.match(/\d+/g)[0], 10);
        data.yield = yields || 0;

        // Get title
        data.title = $('.o-AssetTitle__a-HeadlineText').text();

        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
