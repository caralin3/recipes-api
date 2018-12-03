const rp = require('request-promise');
const cheerio = require('cheerio');

class FoodNetworkScraper {
  constructor (url) {
    this.url = url;
  }

  getTime(text) {
    const raw = text.trim().split(' ');
    const unit1 = raw[1];
    let total = 0;
    if (unit1 === 'hr') {
      const hour = parseInt(raw[0]);
      total = 60 * hour;
      if (raw.length === 4) {
        const unit2 = raw[3];
        if (unit2 === 'min') {
          total += parseInt(raw[2]);
        }
      }
    } else {
      total = parseInt(raw[0]);
    }
    return total;
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
        data.calories = 0;

        // Get cooking times
        const prep = $('.o-RecipeInfo__m-Time').find('li').filter((i, elem) => $(elem).text().includes('Prep'));
        const cook = $('.o-RecipeInfo__m-Time').find('li').filter((i, elem) => $(elem).text().includes('Cook'));
        data.cookTime = this.getTime(cook.text().trim().split('\n')[1].trim());
        data.prepTime = this.getTime(prep.text().trim().split('\n')[1].trim());
        data.totalTime = this.getTime($('.m-RecipeInfo__a-Description--Total').text());

        // Get directions
        let directions = [];
        $('.o-Method__m-Step').each((i, elem) => {
          directions[i] = $(elem).text().trim();
        });
        data.directions = directions;

        // Get ingredients
        let ingredients = [];
        $('.o-Ingredients__a-Ingredient').each((i, elem) => {
          ingredients[i] =  $(elem).text().trim();
        });
        data.ingredients = ingredients;
        
        // Get notes
        let notes = [];
        $('.o-ChefNotes__a-Description').each((i, elem) => {
          notes[i] =  $(elem).text().trim();
        });
        data.notes = notes;

        // Get Yield
        const servings = $('.o-RecipeInfo__m-Yield').find('.o-RecipeInfo__a-Description').text();
        const yields = parseInt(servings.match(/\d+/g)[0]);
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
      })
  }
}

module.exports = FoodNetworkScraper;
