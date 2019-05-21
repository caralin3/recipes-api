"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_1 = __importDefault(require("cheerio"));
const request_promise_1 = __importDefault(require("request-promise"));
const scraper_1 = __importDefault(require("./scraper"));
// Not Working
class KitchnScraper extends scraper_1.default {
    constructor(url) {
        super(url);
    }
    getTimes(text) {
        const obj = {};
        if (text) {
            const times = text.split(';');
            times.forEach((time) => {
                const t = time.toLowerCase().trim();
                const section = t.split(' ');
                if (section[3] === 'minutes') {
                    obj[section[0]] = parseInt(section[2], 10);
                }
            });
        }
        return obj;
    }
    getYield(raw) {
        const text = raw.split(' ');
        const obj = {};
        text.forEach((str, i) => {
            const add = i + 1;
            if (str.toLowerCase().trim() === 'makes') {
                let j = add;
                while (j < text.length) {
                    if (!isNaN(parseInt(text[j], 10))) {
                        obj['yield'] = parseInt(text[j], 10);
                        break;
                    }
                    else {
                        j += 1;
                    }
                }
            }
            else if (str.toLowerCase().trim() === 'serves') {
                obj['servings'] = parseInt(text[add], 10);
            }
        });
        return obj;
    }
    scrape() {
        const data = {
            src: 'The Kitchn',
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
            const calories = parseInt($('.NutritionalGuide__nutrient-quantity').first().text(), 10);
            data.calories = calories || 0;
            // Get cooking times
            const times = this.getTimes($('.PostRecipe__time').text());
            data.cookTime = times['cooking'] || 0;
            data.prepTime = times['prep'] || 0;
            // Get directions
            const directions = [];
            $('.PostRecipeInstructionGroup__step').each((i, elem) => {
                directions[i] = $(elem).text().trim();
            });
            data.directions = directions;
            // Get ingredients
            const ingredients = [];
            $('.PostRecipeIngredientGroup__ingredient').each((i, elem) => {
                ingredients[i] = $(elem).text().trim();
            });
            data.ingredients = ingredients;
            // Get notes
            const notes = [];
            $('.typeset--longform').last().find('p').each((i, elem) => {
                if ($(elem).parent().parent().attr('class') !== 'PostRecipeInstructionGroup__step') {
                    notes.push($(elem).text().trim());
                }
            });
            data.notes = notes;
            // Get Yield
            const counts = this.getYield($('.PostRecipe__yield').text());
            data.servings = counts['servings'] || 0;
            data.yield = counts['yield'] || 0;
            // Get title
            data.title = $('.PostRecipe').find('h2').text();
            return data;
        })
            .catch((err) => {
            console.log(err);
        });
    }
}
exports.default = KitchnScraper;
//# sourceMappingURL=kitchnScraper.js.map