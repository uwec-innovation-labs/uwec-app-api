var { buildSchema } = require('graphql')

var appSchema = buildSchema(`
    type Query {
        laundry(id:Int!): Laundry
        weather: Weather
        bus_data(stops:[Int], routes:[Int], buses:[Int]): BusData
        laundryRoom(building:String!): LaundryRoom
        news: [News]
        dining: [Dining]
        nutrition(number:String!,uomID:Int!): NutritionInfo
        events: [Event]
    }

    type Dining {
        name: String
        hours: [String]
        menu: [MenuItem]
    }

    type MenuItem {
        name: String
        number: String
        uomID: Int
    }

    type NutritionInfo {
        name: String
        allergens: [String]
        vegetarian: Boolean
        vegan: Boolean
        description: String
        ingredients: String
        calories: String
        caloriesFromFat: String
        fat: String
        saturatedFat: String
        transFat: String
        protein: String
        carbohydrates: String
        fiber: String
        sugar: String
        sodium: String
        iron: String
        cholesterol: String
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
        user: String
        id: Int
        jobNumber: Int
        startTime: Float
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
