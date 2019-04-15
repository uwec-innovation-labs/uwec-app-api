const express = require('express')
const graphqlHTTP = require('express-graphql')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
var path = require('path');
var appController = require("./appController.js");

//get data types (Query, Solar, Building, Date)
var schema = require("./appSchema.js").appSchema;
const app = express();

var global = {
  laundry: appController.getLaundry,
  weather: appController.getWeather,
  bus_data: appController.getBus,
  news: appController.getNews
}

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: global,
    graphiql: true
  })
)

app.listen(4000, () => console.log('GraphQL is running on port 4000'))
