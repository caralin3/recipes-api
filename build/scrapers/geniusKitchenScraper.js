"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const request_promise_1 = __importDefault(require("request-promise"));
class GeniusKitchenScraper {
    constructor(url) {
        this.url = url;
    }
    getTotalTime(text) {
        const raw = text.trim().split('\n');
        if (raw.length > 1) {
            const hours = raw[raw.length - 4].trim();
            const minutes = raw[raw.length - 1].trim();
            let total = 0;
            if (hours && !isNaN(parseInt(hours, 10))) {
                const hour = parseInt(hours.match(/\d+/g)[0], 10);
                const mins = parseInt(minutes.match(/\d+/g)[0], 10);
                total = Math.ceil(60 * hour);
                total += mins;
            }
            else {
                const num = parseInt(minutes.match(/\d+/g)[0], 10);
                const unit = minutes.match(/[a-zA-Z]+/g)[0];
                if (unit === 'hrs') {
                    total = Math.ceil(60 * num);
                }
                else {
                    total = num;
                }
            }
            return total;
        }
        return 0;
    }
    scrape() {
        const data = {};
        const options = {
            uri: this.url,
            transform: (body) => {
                return cheerio_1.default.load(body);
            }
        };
        return request_promise_1.default(options)
            .then(($) => {
            // Get calories
            data.calories = parseInt($('.calories').text(), 10) || 0;
            // Get cooking times
            data.cookTime = 0;
            data.prepTime = 0;
            data.totalTime = this.getTotalTime($('.time').text()) || 0;
            // Get directions
            const directions = [];
            $('.directions-inner').find('li').each((i, elem) => {
                if ($(elem).text().trim()) {
                    directions.push($(elem).text().trim());
                }
            });
            directions.pop();
            data.directions = directions;
            // Get ingredients
            const ingredients = [];
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
            const field = $('.count').parent().parent().attr('class');
            if (field) {
                counts[field.toLowerCase().trim()] = parseInt($('.count').text(), 10);
            }
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
        });
    }
}
exports.default = GeniusKitchenScraper;
//# sourceMappingURL=geniusKitchenScraper.js.map