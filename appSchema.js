var { buildSchema } = require('graphql')

var appSchema = buildSchema(`
    type Query {
        laundry(id:Int!): Laundry
        weather: Weather
    }

    type Laundry {
        id: Int
        timeRemaining: Int
    }

    type Weather {
        degrees: String,
        status: String,
        precipitation: Int
    }

`)

module.exports = {
    "appSchema": appSchema
}