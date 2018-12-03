const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const AllRecipesScraper = require('./src/allRecipesScraper');
const FoodAndWineScraper = require('./src/foodAndWineScraper');
const FoodNetworkScraper = require('./src/foodNetworkScraper');
const GeniusKitchenScraper = require('./src/geniusKitchenScraper');
const KitchnScraper = require('./src/kitchnScraper');
const SpruceScraper = require('./src/spruceEatsScraper');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://recipemine-prod.firebaseapp.com/recipes");
  // res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/*', (req, res, next) => {
  const url = req.query.url;
  if (url) {
    let scraper;
    if (url.includes('allrecipes')) {
      scraper = new AllRecipesScraper(url);
    } else if (url.includes('foodandwine')) {
      scraper = new FoodAndWineScraper(url);
    } else if (url.includes('foodnetwork')) {
      scraper = new FoodNetworkScraper(url);
    } else if (url.includes('geniuskitchen')) {
      scraper = new GeniusKitchenScraper(url);
    } else if (url.includes('thekitchn')) {
      scraper = new KitchnScraper(url);
    } else if (url.includes('thespruceeats')) {
      scraper = new SpruceScraper(url);
    }
    if (scraper) {
      scraper.scrape().then(data => {
        if (data) {
          return res.json({
            ...data,
            status: 'success',
          })
        } else {
          return res.json({
            status: 'failure',
            errorMessage: 'Error retrieving data',
          })
        }
      }).catch((err) => res.json({
        status: 'failure',
        errorMessage: err.message,
      }));
    } else {
      return res.json({
        status: 'failure',
        errorMessage: 'Website is not supported',
      })
    }
  } else {
    return res.json({
      status: 'failure',
      errorMessage: 'No url provided',
    })
  }
});
