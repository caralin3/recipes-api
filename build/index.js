"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const scrapers_1 = require("./scrapers");
dotenv_1.default.config({
    path: path_1.default.join(__dirname, `../.env.${process.env.NODE_ENV}`)
});
const app = express_1.default()
    .use(cors_1.default());
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
        const scraper = scrapers_1.getScraper(url);
        if (scraper) {
            scraper.scrape().then((data) => {
                if (data) {
                    return res.json({
                        data,
                        status: 'success',
                        message: 'Data retrieved'
                    });
                }
                return res.json({
                    status: 'error',
                    message: 'Error retrieving data',
                });
            }).catch((err) => res.json({
                status: 'error',
                message: err.message,
            }));
        }
        else {
            return res.json({
                status: 'error',
                message: 'Website is not supported',
            });
        }
    }
    else {
        return res.json({
            status: 'error',
            message: 'No url provided',
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map