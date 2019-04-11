var { buildSchema } = require('graphql')

var appSchema = buildSchema(`
    type Query {
        laundry(id:Int!): Laundry
        weather: Weather
        bus_data(stop:Int): BusData
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

    type BusData {
        buses: [Bus]
        routes: [Route]
    }

    type Route {
        name: String
        id: Int
        stops: [Int]
        path: [String]
    }

    type Bus {
        id: String,
        name: String
        lat: String
        lon: String
        heading: Int
        lastStop: Int
        route: Int
        bus_type: String
    }
`)

module.exports = {
    "appSchema": appSchema
}