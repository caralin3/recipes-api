const express = require('express');
const app = express();
const port = 3000;

const AllRecipesScraper = require('./allRecipesScraper');
const FoodAndWineScraper = require('./foodAndWineScraper');
// const FoodNetworkScraper = require('./foodNetworkScraper');
const GeniusKitchenScraper = require('./geniusKitchenScraper');
const KitchnScraper = require('./kitchnScraper');

app.get('/*', (req, res, next) => {
  const url = req.query.url;
  if (url) {
    let scraper;
    if (url.includes('thekitchn')) {
      scraper = new KitchnScraper(url);
    } else if (url.includes('allrecipes')) {
      scraper = new AllRecipesScraper(url);
    } else if (url.includes('geniuskitchen')) {
      scraper = new GeniusKitchenScraper(url);
    } else if (url.includes('foodandwine')) {
      scraper = new FoodAndWineScraper(url);
    } 
    // else if (url.includes('foodnetwork')) {
    //   scraper = new FoodNetworkScraper(url);
    // }
    if (scraper) {
      scraper.scrape().then(data => {
        if (data) {
          return res.json({
            ...data,
            status: 'success',
          })
        } else {
          res.json({
            status: 'failure',
            errorMessage: 'Error retrieving data',
          })
        }
      }).catch((err) => res.json({
        status: 'failure',
        errorMessage: err.message,
      }));
    } else {
      res.json({
        status: 'failure',
        errorMessage: 'Website is not supported',
      })
    }
  } else {
    res.json({
      status: 'failure',
      errorMessage: 'No url provided',
    })
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});

