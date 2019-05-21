import AllRecipesScraper from './allRecipesScraper';
import FoodAndWineScraper from './foodAndWineScraper';
import FoodNetworkScraper from './foodNetworkScraper';
import GeniusKitchenScraper from './geniusKitchenScraper';
import KitchnScraper from './kitchnScraper';
import Scraper from './scraper';
import SpruceEatsScraper from './spruceEatsScraper';

export const getScraper = (url: string): Scraper => {
  if (url.includes('allrecipes')) {
    return new AllRecipesScraper(url);
  }
  if (url.includes('foodandwine')) {
    return new FoodAndWineScraper(url);
  }
  if (url.includes('foodnetwork')) {
    return new FoodNetworkScraper(url);
  }
  if (url.includes('geniuskitchen')) {
    return new GeniusKitchenScraper(url);
  }
  if (url.includes('thekitchn')) {
    return new KitchnScraper(url);
  }
  if (url.includes('thespruceeats')) {
    return new SpruceEatsScraper(url);
  }
};
