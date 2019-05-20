import cheerio from 'cheerio';
import rp from 'request-promise';
import { Recipe } from '../models';

export default class FoodNetworkScraper {
  private url: string;

  constructor (url: string) {
    this.url = url;
  }

  getTime(text: string) {
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
        const prep = $('.o-RecipeInfo__m-Time').find('li')
          .filter((i: any, elem: any) => $(elem).text().includes('Prep'));
        const cook = $('.o-RecipeInfo__m-Time').find('li')
          .filter((i: any, elem: any) => $(elem).text().includes('Cook'));
        data.cookTime = this.getTime(cook.text().trim().split('\n')[1].trim());
        data.prepTime = this.getTime(prep.text().trim().split('\n')[1].trim());
        data.totalTime = this.getTime($('.m-RecipeInfo__a-Description--Total').text());

        // Get directions
        const directions: string[] = [];
        $('.o-Method__m-Step').each((i: any, elem: any) => {
          directions[i] = $(elem).text().trim();
        });
        data.directions = directions;

        // Get ingredients
        const ingredients: string[] = [];
        $('.o-Ingredients__a-Ingredient').each((i: any, elem: any) => {
          ingredients[i] =  $(elem).text().trim();
        });
        data.ingredients = ingredients;
        
        // Get notes
        const notes: string[] = [];
        $('.o-ChefNotes__a-Description').each((i: any, elem: any) => {
          notes[i] =  $(elem).text().trim();
        });
        data.notes = notes;

        // Get Yield
        const servings = $('.o-RecipeInfo__m-Yield').find('.o-RecipeInfo__a-Description').text();
        const yields = parseInt(servings.match(/\d+/g)[0], 10);
        data.servings = 0;

        data.src = 'Food Network';

        // Get title
        data.title = $('.o-AssetTitle__a-HeadlineText').text();

        data.url = this.url;
        data.yield = yields || 0;

        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
