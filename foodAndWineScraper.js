const rp = require('request-promise');
const cheerio = require('cheerio');

class FoodAndWineScraper {
  constructor (url) {
    this.url = url;
  }

  getTotalTime(text) {
    const raw = text.trim().split(' ');
    const unit1 = raw[1];
    let total = 0;
    if (unit1 === 'HR') {
      const hour = parseInt(raw[0]);
      total = 60 * hour;
      if (raw.length === 4) {
        const unit2 = raw[3];
        if (unit2 === 'MIN') {
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
        const time = $('.recipe-meta-item-header').filter((i, elem) => $(elem).text().includes('Total Time'))
        data.cookTime = 0;
        data.prepTime = 0;
        data.totalTime = this.getTotalTime(time.next().text().trim()) || 0;

        // Get directions
        let directions = [];
        $('.step').find('p').each((i, elem) => {
          directions[i] = $(elem).text().trim();
        });
        data.directions = directions;

        // Get ingredients
        let ingredients = [];
        $('.ingredients').find('li').each((i, elem) => {
          ingredients[i] =  $(elem).text().trim();
        });
        data.ingredients = ingredients;
        
        // Get notes
        data.notes = [];

        // Get Yield
        const serves = $('.recipe-meta-item-body').filter((i, elem) => $(elem).text().includes('Serves'))
        const servings = parseInt(serves.text().match(/\d+/g)[0]);
        data.servings = servings || 0;

        // Get title
        data.title = $('.recipe-header').find('h1').text();

        data.url = this.url;
        data.yield = 0;

        return data;
      })
      .catch((err) => {
        console.log(err);
      })
  }
}

module.exports = FoodAndWineScraper;
