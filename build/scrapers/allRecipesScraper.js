"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const request_promise_1 = __importDefault(require("request-promise"));
const scraper_1 = __importDefault(require("./scraper"));
class AllRecipesScraper extends scraper_1.default {
    constructor(url) {
        super(url);
    }
    getTimes(text) {
        const raw = text.trim().split('\n');
        const obj = {};
        raw.forEach(time => {
            if (time.trim() !== '') {
                const times = time.trim().split(' ');
                if (times[0].includes('Prep')) {
                    if (times[times.length - 1] === 'm') {
                        obj.prepTime = parseInt(times[0].slice(4), 10);
                    }
                }
                else if (times[0].includes('Cook')) {
                    if (times[times.length - 1] === 'm') {
                        obj.cookTime = parseInt(times[0].slice(4), 10);
                    }
                }
                else if (times[1].includes('In')) {
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
                        }
                        else {
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
        const data = {
            src: 'AllRecipes',
            url: this.url,
            yield: 0,
        };
        const options = {
            uri: this.url,
            transform: (body) => {
                return cheerio_1.default.load(body);
            }
        };
        return request_promise_1.default(options)
            .then(($) => {
            // Get calories
            data.calories = parseInt($('.calorie-count').text().split(' ')[0], 10);
            // Get cooking times
            const times = this.getTimes($('.prepTime').text());
            data.cookTime = times.cookTime || 0;
            data.prepTime = times.prepTime || 0;
            data.totalTime = times.totalTime || 0;
            // Get directions
            const directions = [];
            $('.step').each((i, elem) => {
                if ($(elem).text().trim()) {
                    directions.push($(elem).text().trim());
                }
            });
            data.directions = directions;
            // Get ingredients
            const ingredients = [];
            $('.recipe-ingred_txt').each((i, elem) => {
                if ($(elem).text().trim() && $(elem).text().trim() !== 'Add all ingredients to list') {
                    ingredients.push($(elem).text().trim());
                }
            });
            data.ingredients = ingredients;
            // Get notes
            const notes = [];
            $('.recipe-footnotes').find('li').each((i, elem) => {
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
            .catch((err) => {
            console.log(err);
        });
    }
}
exports.default = AllRecipesScraper;
//# sourceMappingURL=allRecipesScraper.js.map