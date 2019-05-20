"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const allRecipesScraper_1 = __importDefault(require("./allRecipesScraper"));
const foodAndWineScraper_1 = __importDefault(require("./foodAndWineScraper"));
const foodNetworkScraper_1 = __importDefault(require("./foodNetworkScraper"));
const geniusKitchenScraper_1 = __importDefault(require("./geniusKitchenScraper"));
const kitchnScraper_1 = __importDefault(require("./kitchnScraper"));
const spruceEatsScraper_1 = __importDefault(require("./spruceEatsScraper"));
exports.getScraper = (url) => {
    if (url.includes('allrecipes')) {
        return new allRecipesScraper_1.default(url);
    }
    if (url.includes('foodandwine')) {
        return new foodAndWineScraper_1.default(url);
    }
    if (url.includes('foodnetwork')) {
        return new foodNetworkScraper_1.default(url);
    }
    if (url.includes('geniuskitchen')) {
        return new geniusKitchenScraper_1.default(url);
    }
    if (url.includes('thekitchn')) {
        return new kitchnScraper_1.default(url);
    }
    if (url.includes('thespruceeats')) {
        return new spruceEatsScraper_1.default(url);
    }
};
//# sourceMappingURL=index.js.map