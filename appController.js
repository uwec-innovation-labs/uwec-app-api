const sql = require('mssql')
const request = require('request-promise')
const axios = require('axios')
const cheerio = require('cheerio')
const newsURL = 'https://www.spectatornews.com/'

async function getLaundry(parent, args, context, info) {
  var id = parent.id

  //get the machine's remaining time, somehow
  var remainingTime = 100

  var laundry = {
    id: id,
    timeRemaining: 100
  }
  return laundry
}

// Function to grab laundry room data - dummy data
async function getLaundryRoom(parent, args, context, info) {
  // Return laundryRoom with dummy data for the stats of the room
  var laundryRoom = {
    id: 'Towers_South',
    totalNumWashers: 9,
    totalNumDryers: 9,
    washersAvailable: 4,
    dryersAvailable: 5
  }
  return laundryRoom
}

async function getWeather(parent, args, context, info) {
  //I'm using Dark Sky API, which is free for 1000 calls per day
  let weather = await request(
    'https://api.darksky.net/forecast/06ff069b5fc165f7197cc7c1544e1214/44.8113,-91.4985',
    function(error, response, body) {}
  )
  var data = JSON.parse(weather)
  var returnValue = {
    degrees: data.currently.temperature + '',
    status: data.currently.summary,
    precipitation: data.currently.precipProbability * 100
  }
  return returnValue
}

async function getBus(parent, args, context, info) {
  var myBuses
  if (parent.buses != undefined) {
    let busData = JSON.parse(
      await request('http://ectbustracker.doublemap.com/map/v2/buses', function(
        error,
        response,
        body
      ) {})
    )
    myBuses = busData.filter(function(value, index, arr) {
      return parent.buses.includes(value.id)
    })
  }

  var myRoutes
  if (parent.routes != undefined) {
    let routeData = JSON.parse(
      await request(
        'http://ectbustracker.doublemap.com/map/v2/routes',
        function(error, response, body) {}
      )
    )
    myRoutes = routeData.filter(function(value, index, arr) {
      return parent.routes.includes(value.id)
    })

    //if no particular stops are defined, the only stop information available will be the id, because it takes far too much time to generate name and ETA for each stop along a route
    if (parent.stops == undefined) {
      myRoutes.forEach(function(route) {
        var newStops = []
        route.stops.forEach(function(stop, i) {
          var stopId = stop
          var newStop = {
            id: stopId
          }
          newStops.push(newStop)
        })
        route.stops = newStops
      })
    }
  }

  var myStops
  if (parent.stops != undefined) {
    let stopData = JSON.parse(
      await request('http://ectbustracker.doublemap.com/map/v2/stops', function(
        error,
        response,
        body
      ) {})
    )
    if (parent.stops != undefined) {
      stopData = stopData.filter(function(value, index, arr) {
        return parent.stops.includes(value.id)
      })
    }
    myStops = stopData

    //add ETA data
    var i = 0
    while (i < myStops.length) {
      var stop = myStops[i]
      let etaData = JSON.parse(
        await request(
          'http://ectbustracker.doublemap.com/map/v2/eta?stop=' + stop.id,
          function(error, response, body) {}
        )
      )
      stop.etas = etaData.etas['' + stop.id].etas
      i++
    }

    if (parent.routes != undefined) {
      myRoutes.forEach(function(route) {
        if (parent.stops != undefined) {
          route.stops = route.stops.filter(function(value, index, arr) {
            return parent.stops.includes(value)
          })
        }
        var s = 0
        while (s < route.stops.length) {
          var findStop = route.stops[s]
          route.stops[s] = myStops.find(function(element) {
            return element.id == findStop
          })
          s++
        }
      })
      myRoutes = myRoutes.filter(function(value, index, arr) {
        return value.stops.length > 0
      })
    }
  }

  var data = {
    buses: myBuses,
    routes: myRoutes,
    stops: myStops
  }
  return data
}

async function getNews(parent, args, context, info) {
  let data = await axios
    .get(newsURL)
    .then(response => {
      if (response.status === 200) {
        // reads, loads, and parses html into readable form
        // current version scrapes for top navigation bar
        // final implementation will scrape for alternate parking banner and it's details
        const html = response.data
        const $ = cheerio.load(html)
        let newsItems = []

        $('.carousel-widget-slide').each((i, elm) => {
          var title = $('a[class=homeheadline]', $(elm)).html()
          var link = $(elm)
            .children('a')
            .attr('href')
          var image = $(elm)
            .children('a')
            .children('img')
            .attr('src')
          newsItems.push({
            title: title,
            link: link,
            image: image
          })
        })

        return newsItems
      }
    })
    .then(response => {
      return response
    })
  return data
}

module.exports = {
  getLaundry: getLaundry,
  getWeather: getWeather,
  getBus: getBus,
  getLaundryRoom: getLaundryRoom,
  getNews: getNews
}
