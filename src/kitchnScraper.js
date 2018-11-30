const rp = require('request-promise');
const cheerio = require('cheerio');

class KitchnScraper {
  constructor (url) {
    this.url = url;
  }

  getTimes(text) {
    const obj = {};
    if (text) {
      const times = text.split(';');
      times.forEach((time) => {
        const t = time.toLowerCase().trim();
        const section = t.split(' ');
        if (section[3] === 'minutes') {
          obj[section[0]] = parseInt(section[2]);
        }
      })
    }
    return obj;
  }

  getYield(raw) {
    const text = raw.split(' ');
    const obj = {};
    text.forEach((str, i) => {
      if (str.toLowerCase().trim() === 'makes') {
        let j = ++i;
        while (j < text.length) {
          if (!isNaN(parseInt(text[j]))) {
            obj['yield'] = parseInt(text[j]);
            break;
          } else {
            j++;
          }
        }
      } else if (str.toLowerCase().trim() === 'serves') {
        obj['servings'] = parseInt(text[++i]);
      }
    });
    return obj;
  }

  scrape() {
    let data = {};
    const options = {
      uri: this.url,
      transform: (body) => {
        return cheerio.load(body);
      }
    }
    return rp(options)
      .then(($) => {
        // Get calories
        const calories = parseInt($('.NutritionalGuide__nutrient-quantity').first().text());
        data.calories = calories || 0;

        // Get cooking times
        const times = this.getTimes($('.PostRecipe__time').text());
        data.cookTime = times['cooking'] || 0;
        data.prepTime = times['prep'] || 0;

        // Get directions
        const directions = [];
        $('.PostRecipeInstructionGroup__step').each((i, elem) => {
          directions[i] = $(elem).text().trim();
        });
        data.directions = directions;

        // Get ingredients
        const ingredients = [];
        $('.PostRecipeIngredientGroup__ingredient').each((i, elem) => {
          ingredients[i] = $(elem).text().trim();
        });
        data.ingredients = ingredients;
        
        // Get notes
        const notes = [];
        $('.typeset--longform').last().find('p').each((i, elem) => {
          if ($(elem).parent().parent().attr('class') !== 'PostRecipeInstructionGroup__step') {
            notes.push($(elem).text().trim())
          }
        });
        data.notes = notes;

        // Get Yield
        const counts = this.getYield($('.PostRecipe__yield').text());
        data.servings = counts['servings'] || 0;

        data.src = 'TheKitchn';

        // Get title
        data.title = $('.PostRecipe').find('h2').text();

        data.url = this.url;
        data.yield = counts['yield'] || 0;

        return data;
      })
      .catch((err) => {
        console.log(err);
      })
  }
}

module.exports = KitchnScraper;
