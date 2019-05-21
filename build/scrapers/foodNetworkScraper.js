"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const request_promise_1 = __importDefault(require("request-promise"));
const scraper_1 = __importDefault(require("./scraper"));
class FoodNetworkScraper extends scraper_1.default {
    constructor(url) {
        super(url);
    }
    getTime(text) {
        const raw = text.trim().split(' ');
        const unit1 = raw[1];
        let total = 0;
        if (unit1 === 'hr') {
            const hour = parseInt(raw[0], 10);
            total = 60 * hour;
            if (raw.length === 4) {
                const unit2 = raw[3];
                if (unit2 === 'min') {
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
            servings: 0,
            src: 'Food Network',
            url: this.url,
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
            const prep = $('.o-RecipeInfo__m-Time').find('li')
                .filter((i, elem) => $(elem).text().includes('Prep'));
            const cook = $('.o-RecipeInfo__m-Time').find('li')
                .filter((i, elem) => $(elem).text().includes('Cook'));
            data.cookTime = this.getTime(cook.text().trim().split('\n')[1].trim());
            data.prepTime = this.getTime(prep.text().trim().split('\n')[1].trim());
            data.totalTime = this.getTime($('.m-RecipeInfo__a-Description--Total').text());
            // Get directions
            const directions = [];
            $('.o-Method__m-Step').each((i, elem) => {
                directions[i] = $(elem).text().trim();
            });
            data.directions = directions;
            // Get ingredients
            const ingredients = [];
            $('.o-Ingredients__a-Ingredient').each((i, elem) => {
                ingredients[i] = $(elem).text().trim();
            });
            data.ingredients = ingredients;
            // Get notes
            const notes = [];
            $('.o-ChefNotes__a-Description').each((i, elem) => {
                notes[i] = $(elem).text().trim();
            });
            data.notes = notes;
            // Get Yield
            const servings = $('.o-RecipeInfo__m-Yield').find('.o-RecipeInfo__a-Description').text();
            const yields = parseInt(servings.match(/\d+/g)[0], 10);
            data.yield = yields || 0;
            // Get title
            data.title = $('.o-AssetTitle__a-HeadlineText').text();
            return data;
        })
            .catch((err) => {
            console.log(err);
        });
    }
}
exports.default = FoodNetworkScraper;
//# sourceMappingURL=foodNetworkScraper.js.map