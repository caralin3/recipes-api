const rp = require('request-promise');
const cheerio = require('cheerio');

class AllRecipesScraper {
  constructor (url) {
    this.url = url;
  }

  getTimes(text) {
    const raw = text.trim().split('\n');
    const obj = {};
    raw.forEach(time => {
      if (time.trim() !== '') {
        const times = time.trim().split(' ');
        if (times[0].includes('Prep')) {
          if (times[times.length - 1] == 'm') {
            obj['prepTime'] = parseInt(times[0].slice(4));
          }
        } else if (times[0].includes('Cook')) {
          if (times[times.length - 1] == 'm') {
            obj['cookTime'] = parseInt(times[0].slice(4));
          }
        } else if (times[1].includes('In')) {
          let total = 0;
          if (times[times.length - 1] == 'm') {
            let min = parseInt(times[times.length - 2].slice(2));
            if (isNaN(min)) {
              min = parseInt(times[times.length - 2]);
            }
            if (times[2] == 'h') {
              const hour = parseInt(times[1].slice(2));
              if (hour !== 0 || !isNaN(hour)) {
                total = Math.ceil(60 * hour);
              }
              total += min;
            } else {
              total = min;
            }
          }
          obj['totalTime'] = total;
        }
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
        data.calories = parseInt($('.calorie-count').text().split(' ')[0]);

        // Get cooking times
        const times = this.getTimes($('.prepTime').text());
        data.cookTime = times['cookTime'] || 0;
        data.prepTime = times['prepTime'] || 0;
        data.totalTime = times['totalTime'] || 0;

        // Get directions
        let directions = [];
        $('.step').each((i, elem) => {
          if ($(elem).text().trim()) {
            directions.push($(elem).text().trim());
          }
        });
        data.directions = directions;

        // Get ingredients
        let ingredients = [];
        $('.recipe-ingred_txt').each((i, elem) => {
          if ($(elem).text().trim() && $(elem).text().trim() !== 'Add all ingredients to list') {
            ingredients.push($(elem).text().trim())
          }
        });
        data.ingredients = ingredients;
        
        // Get notes
        const notes = [];
        $('.recipe-footnotes').find('li').each((i, elem) => {
          if (i !== 0) {
            notes.push($(elem).text().trim())
          }
        });
        data.notes = notes;

        // Get Yield
        const servings = parseInt($('#metaRecipeServings').attr('content'));
        data.servings = servings || 0;

        data.src = 'AllRecipes';

        // Get title
        data.title = $('#recipe-main-content').text();

        data.url = this.url;
        data.yield = 0;

        return data;
      })
      .catch((err) => {
        console.log(err);
      })
  }
}

module.exports = AllRecipesScraper;
