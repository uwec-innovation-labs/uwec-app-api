const sql = require('mssql')
const request = require('request-promise')

async function getLaundry(parent, args, context, info) {
    var id = parent.id;

    //get the machine's remaining time, somehow
    var remainingTime = 100;

    var laundry = {
        "id": id,
        "timeRemaining": 100
    }
    return laundry;
}

async function getWeather(parent, args, context, info) {
    //I'm using Dark Sky API, which is free for 1000 calls per day
    let weather = await request("https://api.darksky.net/forecast/06ff069b5fc165f7197cc7c1544e1214/44.8113,-91.4985", function(error, response, body) {});
    var data = JSON.parse(weather);
        var returnValue = {
            degrees: data.currently.temperature + "",
            status: data.currently.summary,
            precipitation: data.currently.precipProbability * 100
        }
    return returnValue;
}

async function getBus(parent, args, context, info) {
    let busData = await request("http://ectbustracker.doublemap.com/map/v2/buses", function(error, response, body) {});
    let routeData = await request("http://ectbustracker.doublemap.com/map/v2/routes", function(error, response, body) {});
    var data = {
        routes: JSON.parse(routeData),
        buses: JSON.parse(busData)
    }
    return data;
}

module.exports = {
    "getLaundry": getLaundry,
    "getWeather": getWeather,
    "getBus": getBus
}