"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const request_promise_1 = __importDefault(require("request-promise"));
class FoodAndWineScraper {
    constructor(url) {
        this.url = url;
    }
    getTotalTime(text) {
        const raw = text.trim().split(' ');
        const unit1 = raw[1];
        let total = 0;
        if (unit1 === 'HR') {
            const hour = parseInt(raw[0], 10);
            total = 60 * hour;
            if (raw.length === 4) {
                const unit2 = raw[3];
                if (unit2 === 'MIN') {
                    total += parseInt(raw[2], 10);
                }
            }
        }
        else {
            total = parseInt(raw[0], 10);
        }
        return total;
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
            data.calories = 0;
            // Get cooking times
            const time = $('.recipe-meta-item-header').filter((i, elem) => $(elem).text().includes('Total Time'));
            data.cookTime = 0;
            data.prepTime = 0;
            data.totalTime = this.getTotalTime(time.next().text().trim()) || 0;
            // Get directions
            const directions = [];
            $('.step').find('p').each((i, elem) => {
                directions[i] = $(elem).text().trim();
            });
            data.directions = directions;
            // Get ingredients
            const ingredients = [];
            $('.ingredients').find('li').each((i, elem) => {
                ingredients[i] = $(elem).text().trim();
            });
            data.ingredients = ingredients;
            // Get notes
            data.notes = [];
            // Get Yield
            const serves = $('.recipe-meta-item-body').filter((i, elem) => $(elem).text().includes('Serves'));
            const servings = parseInt(serves.text().match(/\d+/g)[0], 10);
            data.servings = servings || 0;
            data.src = 'Food & Wine';
            // Get title
            data.title = $('.recipe-header').find('h1').text();
            data.url = this.url;
            data.yield = 0;
            return data;
        })
            .catch((err) => {
            console.log(err);
        });
    }
}
exports.default = FoodAndWineScraper;
//# sourceMappingURL=foodAndWineScraper.js.map