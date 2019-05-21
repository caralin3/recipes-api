"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const request_promise_1 = __importDefault(require("request-promise"));
const scraper_1 = __importDefault(require("./scraper"));
class SpruceEatsScraper extends scraper_1.default {
    constructor(url) {
        super(url);
    }
    getTime(text) {
        const raw = text.trim().split(' ');
        const unit1 = raw[1];
        let total = 0;
        if (unit1 === 'hrs') {
            const hour = parseInt(raw[0], 10);
            total = 60 * hour;
            if (raw.length === 4) {
                const unit2 = raw[3];
                if (unit2 === 'mins') {
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
            src: 'The Spruce Eats',
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
            // Get calories
            // data.calories = 0;
            // Get cooking times
            // const prep = $('.o-RecipeInfo__m-Time').find('li')
            // .filter((i: number, elem: HTMLElement) => $(elem).text().includes('Prep'));
            // const cook = $('.o-RecipeInfo__m-Time').find('li')
            // .filter((i: number, elem: HTMLElement) => $(elem).text().includes('Cook'));
            // data.cookTime = this.getTime(cook.text().trim().split('\n')[1].trim());
            // data.prepTime = this.getTime(prep.text().trim().split('\n')[1].trim());
            // console.log($('#meta-text_1-0').text())
            // data.totalTime = this.getTime($('.m-RecipeInfo__a-Description--Total').text());
            // Get directions
            const directions = [];
            // $('.o-Method__m-Step').each((i: number, elem: HTMLElement) => {
            //   directions[i] = $(elem).text().trim();
            // });
            // data.directions = directions;
            // Get ingredients
            const ingredients = [];
            $('.ingredient').each((i, elem) => {
                ingredients[i] = $(elem).text().trim();
            });
            // data.ingredients = ingredients;
            // Get notes
            const notes = [];
            // $('.o-ChefNotes__a-Description').each((i: number, elem: HTMLElement) => {
            //   notes[i] =  $(elem).text().trim();
            // });
            // data.notes = notes;
            // Get Yield
            // const servings = $('.o-RecipeInfo__m-Yield').find('.o-RecipeInfo__a-Description').text();
            // const yields = parseInt(servings.match(/\d+/g)[0]);
            // data.servings = 0;
            // Get title
            data.title = $('.heading__title').text();
            // data.yield = yields || 0;
            return data;
        })
            .catch((err) => {
            console.log(err);
        });
    }
}
exports.default = SpruceEatsScraper;
//# sourceMappingURL=spruceEatsScraper.js.map