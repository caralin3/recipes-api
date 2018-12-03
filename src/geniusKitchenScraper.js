const rp = require('request-promise');
const cheerio = require('cheerio');

class GeniusKitchenScraper {
  constructor (url) {
    this.url = url;
  }

  getTotalTime(text) {
    const raw = text.trim().split('\n');
    const hours = raw[raw.length - 4].trim();
    const minutes = raw[raw.length - 1].trim();
    let total = 0;
    if (hours && !isNaN(parseInt(hours))) {
      const hour = parseInt(hours.match(/\d+/g)[0]);
      const mins = parseInt(minutes.match(/\d+/g)[0]);
      total = Math.ceil(60 * hour);
      total += mins;
    } else {
      const num = parseInt(minutes.match(/\d+/g)[0]);
      const unit = minutes.match(/[a-zA-Z]+/g)[0];
      if (unit === 'hrs') {
        total = Math.ceil(60 * num);
      } else {
        total = num;
      }
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
        data.calories = parseInt($('.calories').text()) || 0;

        // Get cooking times
        data.cookTime = 0;
        data.prepTime = 0;
        data.totalTime = this.getTotalTime($('.time').text()) || 0;

        // Get directions
        let directions = [];
        $('.directions-inner').find('li').each((i, elem) => {
          if ($(elem).text().trim()) {
            directions.push($(elem).text().trim());
          }
        });
        directions.pop();
        data.directions = directions;

        // Get ingredients
        let ingredients = [];
        $('.ingredient-list').find('li').each((i, elem) => {
          if ($(elem).text().trim()) {
            ingredients.push($(elem).text().trim());
          }
        });
        data.ingredients = ingredients;
        
        // Get notes
        data.notes = [];

        // Get Yield
        const counts = {};
        const field = $('.count').parent().parent().attr('class').toLowerCase().trim();
        counts[field] = parseInt($('.count').text());
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
      })
  }
}

module.exports = GeniusKitchenScraper;
