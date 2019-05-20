import cheerio from 'cheerio';
import rp from 'request-promise';
import { Recipe } from '../models';

// Not Working
export default class KitchnScraper {
  private url: string;

  constructor (url: string) {
    this.url = url;
  }

  getTimes(text: string) {
    const obj: any = {};
    if (text) {
      const times = text.split(';');
      times.forEach((time) => {
        const t = time.toLowerCase().trim();
        const section = t.split(' ');
        if (section[3] === 'minutes') {
          obj[section[0]] = parseInt(section[2], 10);
        }
      });
    }
    return obj;
  }

  getYield(raw: string) {
    const text = raw.split(' ');
    const obj: any = {};
    text.forEach((str, i) => {
      const add = i + 1;
      if (str.toLowerCase().trim() === 'makes') {
        let j = add;
        while (j < text.length) {
          if (!isNaN(parseInt(text[j], 10))) {
            obj['yield'] = parseInt(text[j], 10);
            break;
          } else {
            j += 1;
          }
        }
      } else if (str.toLowerCase().trim() === 'serves') {
        obj['servings'] = parseInt(text[add], 10);
      }
    });
    return obj;
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
        const calories = parseInt($('.NutritionalGuide__nutrient-quantity').first().text(), 10);
        data.calories = calories || 0;

        // Get cooking times
        const times = this.getTimes($('.PostRecipe__time').text());
        data.cookTime = times['cooking'] || 0;
        data.prepTime = times['prep'] || 0;

        // Get directions
        const directions: string[] = [];
        $('.PostRecipeInstructionGroup__step').each((i: any, elem: any) => {
          directions[i] = $(elem).text().trim();
        });
        data.directions = directions;

        // Get ingredients
        const ingredients: string[] = [];
        $('.PostRecipeIngredientGroup__ingredient').each((i: any, elem: any) => {
          ingredients[i] = $(elem).text().trim();
        });
        data.ingredients = ingredients;
        
        // Get notes
        const notes: string[] = [];
        $('.typeset--longform').last().find('p').each((i: any, elem: any) => {
          if ($(elem).parent().parent().attr('class') !== 'PostRecipeInstructionGroup__step') {
            notes.push($(elem).text().trim());
          }
        });
        data.notes = notes;

        // Get Yield
        const counts = this.getYield($('.PostRecipe__yield').text());
        data.servings = counts['servings'] || 0;

        data.src = 'The Kitchn';

        // Get title
        data.title = $('.PostRecipe').find('h2').text();

        data.url = this.url;
        data.yield = counts['yield'] || 0;

        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
