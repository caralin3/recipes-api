"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const request_promise_1 = __importDefault(require("request-promise"));
const scraper_1 = __importDefault(require("./scraper"));
class FoodAndWineScraper extends scraper_1.default {
    constructor(url) {
        super(url);
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
        const data = {
            calories: 0,
            cookTime: 0,
            notes: [],
            prepTime: 0,
            src: 'Food & Wine',
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
            // Get cooking times
            const time = $('.recipe-meta-item-header').filter((i, elem) => $(elem).text().includes('Total Time'));
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
            // Get Servings
            const serves = $('.recipe-meta-item-body').filter((i, elem) => $(elem).text().includes('Serves'));
            const servings = parseInt(serves.text().match(/\d+/g)[0], 10);
            data.servings = servings || 0;
            // Get title
            data.title = $('.recipe-header').find('h1').text();
            return data;
        })
            .catch((err) => {
            console.log(err);
        });
    }
}
exports.default = FoodAndWineScraper;
//# sourceMappingURL=foodAndWineScraper.js.map