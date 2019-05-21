# Recipes API

An api for importing recipe information from supported sites.

## Technology
* [Node.js][node]
* [Express][express]
* [Typescript][typescript]
* [request-promise][request-promise]
* [Cheeriojs][cheerio]

## Getting started

### Installation
```
yarn install
```

### Run
Uses `localhost:8080` as default port unless another is provided.
```
yarn start
```

### Build
```
yarn build
```

### Env Variables
To provide a different localhost port, create env files with the following replacing `<port_number>` with the desired port.
```
PORT=<port_number>
```

## API Specs

* **Url**
  
  `/api/v1/import`

* **Method**
  
  `GET`

* **Url Query Params**

  `url=[string]` (*required*)

* **Success Response**

  * **Code**: 200 <br/>
    **Content**:
    ```
    { "data": { <recipe data> }
      "status": "success",
      "message": "Data retrieved"
    }
    ```
    **data results may vary depending on site*

* **Error Responses**
  * **Code**: 500 <br/>
    **Content**: `{"status": "error", "message": "Error retrieving data"}`

  * **Code**: 500 <br/>
    **Content**: `{"status": "error", "message": <error_message>}`

  * **Code**: 404 <br/>
    **Content**: `{"status": "error", "message": "Website is not supported"}`

  * **Code**: 400 <br/>
    **Content**: `{"status": "error", "message": "No url provided"}`

[cheerio]: https://github.com/cheeriojs/cheerio
[express]: https://expressjs.com/
[node]: https://nodejs.org/en/
[request-promise]: https://github.com/request/request-promise
[typescript]: https://www.typescriptlang.org/
[yarn]: https://yarnpkg.com/
