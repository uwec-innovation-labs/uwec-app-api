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
    let busData = JSON.parse(await request("http://ectbustracker.doublemap.com/map/v2/buses", function(error, response, body) {}));
    let routeData = JSON.parse(await request("http://ectbustracker.doublemap.com/map/v2/routes", function(error, response, body) {}));
    let stopData = JSON.parse(await request("http://ectbustracker.doublemap.com/map/v2/stops", function(error, response, body) {}));
    routeData.forEach(function(route) {
        var newRouteStops = [];
        var routeStops = route.stops;
        routeStops.forEach(function(routeStop) {
            var i = 0;
            var thisStop;
            while (i > -1) {
                if (stopData[i].id == routeStop) {
                    thisStop = {
                        id: stopData[i].id,
                        name: stopData[i].name
                    }
                    newRouteStops.push(thisStop);
                    i = -2;
                }
                i++;
            }
        });
        route.stops = newRouteStops;
    });
    

    var data = {
        buses: busData,
        routes: routeData
    }
    return data;
}

module.exports = {
    "getLaundry": getLaundry,
    "getWeather": getWeather,
    "getBus": getBus
}