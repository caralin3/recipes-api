import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import path from 'path';
import { EndpointResponse, Recipe } from './models';
import { getScraper } from './scrapers';

dotenv.config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`)
});

const app = express()
  .use(cors());
  // .use(bodyParser.json());
const PORT = process.env.PORT || 8080;

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://recipemine-prod.firebaseapp.com");
//   // res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.get('/api/v1/import', (req, res) => {
  const url = req.query.url;
  if (url) {
    const scraper = getScraper(url);
    if (scraper) {
      scraper.scrape().then((data: Recipe) => {
        if (data) {
          return res.json({
            data,
            status: 'success',
            message: 'Data retrieved'
          } as EndpointResponse);
        }
        return res.status(500).json({
          status: 'error',
          message: 'Error retrieving data',
        });
      }).catch ((err) => {
        res.status(500).json({
          status: 'error',
          message: err.message,
        } as EndpointResponse);
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message: 'Website is not supported',
      } as EndpointResponse);
    }
  } else {
    return res.status(400).json({
      status: 'error',
      message: 'No url provided',
    } as EndpointResponse);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
