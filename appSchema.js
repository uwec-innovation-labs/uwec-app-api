var { buildSchema } = require('graphql')

var appSchema = buildSchema(`
    type Query {
        laundry(id:Int!): Laundry
        weather: Weather
        bus_data(stops:[Int], routes:[Int], buses:[Int]): BusData
        laundryRoom(building:String!): LaundryRoom
        message: Message
        news: [News]
        dining: [Dining]
        events: [Event]
    }

    type Mutation {
        emergencyAlert(subject: String!, message: String!): Message!
    }
    type Message {
        subject: String!
        message: String!
    }

    type Dining {
        name: String
        hours: [String]
        menu: [String]
    }

    type News {
        title: String
        link: String
        image: String
    }

    type Event {
        name: String
        time: String
    }

    type Laundry {
        id: Int
        timeRemaining: Int
    }
    
    type LaundryRoom {
        id: String
        totalNumWashers: Int
        totalNumDryers: Int
        washersAvailable: Int
        dryersAvailable: Int
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
  appSchema: appSchema
}
