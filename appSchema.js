var { buildSchema } = require('graphql')

var appSchema = buildSchema(`
    type Query {
        laundry(id:Int!): Laundry
        weather: Weather
        bus_data(stops:[Int], routes:[Int], buses:[Int]): BusData
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
        stops: [Stop]
    }

    type Route {
        name: String
        id: Int
        stops: [Stop]
        path: [String]
    }

    type Stop {
        id: Int
        name: String
        etas: [Eta]
    }

    type Eta {
        bus_id: Int
        route: Int
        avg: Int
    }

    type Bus {
        id: Int,
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