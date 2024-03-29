const sql = require('mssql')
const request = require('request-promise')
const axios = require('axios')
const cheerio = require('cheerio')
const newsURL = 'https://www.spectatornews.com/'
const foodURL =
  'https://www.uwec.edu/campus-life/housing-dining/dining/food-services/dining-hours/'
const calendarURL = 'https://calendar.uwec.edu/MasterCalendar.aspx'
// const MongoClient = require('mongodb').MongoClient
// const mongoURL = 'Insert URL here'

const diningURL = 'https://bite-external-api.azure-api.net/extern/menus/'
const hilltopLocationID = '84956001'
const hilltopMenuID = '14916'
const daviesLocationID = '84956004'
const daviesMenuID = '24TW3'
const dulanyLocationID = '84956010'
const dulanyMenuID = '14843'
const cabinLocationID = '84956022'
const cabinMenuID = '14844'
const sendmail = require('sendmail')
const MESSAGE_ENDPOINT = 'http://3217019a.ngrok.io/message'
const fetch = require('node-fetch')

/*async function getEvents(parent, args, context, info) {
  setTimeout( function (i) {
      request(calendarURL, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body,{
          ignoreWhitespace: true
        });
        console.log("post load");
        console.log($('body').find('.show-this-week'));
      }
    });
  }, 10000);

  console.log("set timeout");

  /*let data = await axios
    .get(calendarURL)
    .then(response => {
      if (response.status === 200) {
        const html = response.data
        const $ = cheerio.load(html)
        let events = [];
        console.log($('.show-this-week').find('div').length);
        
        return events;
      }
    })
    .then(response => {
      return response
    })
  return data
}*/

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
  let laundryRoom
  if (parent.building === 'towers') {
    laundryRoom = {
      id: parent.building,
      totalNumWashers: 9,
      totalNumDryers: 9,
      washersAvailable: 4,
      dryersAvailable: 55
    }
  } else if (parent.building === 'bridgman') {
    laundryRoom = {
      id: parent.building,
      totalNumWashers: 4,
      totalNumDryers: 4,
      washersAvailable: 4,
      dryersAvailable: 5
    }
  } else if (parent.building === 'horan') {
    laundryRoom = {
      id: parent.building,
      totalNumWashers: 22,
      totalNumDryers: 22,
      washersAvailable: 4,
      dryersAvailable: 5
    }
  } else if (parent.building === 'oak') {
    laundryRoom = {
      id: parent.building,
      totalNumWashers: 1,
      totalNumDryers: 2,
      washersAvailable: 4,
      dryersAvailable: 5
    }
  } else {
    laundryRoom = {
      id: parent.building,
      totalNumWashers: 999,
      totalNumDryers: 999,
      washersAvailable: 4,
      dryersAvailable: 5
    }
  }
  return laundryRoom
}
async function setEmergencyAlert(parent, args, context, info) {
  const message = {
    subject: parent.subject,
    message: parent.message
  }
  fetch(MESSAGE_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Emergency Alert: ' + message.subject + '\n' + message.message
    })
  })
  return message
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
        const html = response.data
        const $ = cheerio.load(html)
        let newsItems = []

        $('.carousel-widget-slide').each((i, elm) => {
          var title = $('a[class=homeheadline]', $(elm)).text()
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

function GetFormattedDate() {
  var todayTime = new Date()
  var month = todayTime.getMonth() + 1
  var day = todayTime.getDate()
  return month + '-' + day
}

async function getDining(parent, args, context, info) {
  var today = GetFormattedDate()
  var REastBreakfast = []
  var REastLunch = []
  var REastDinner = []
  await axios({
    method: 'get',
    url:
      diningURL +
      hilltopLocationID +
      '/' +
      today +
      '/' +
      today +
      '/' +
      hilltopMenuID,
    headers: {
      'sodexo-accesscodes': '24TW3',
      'Ocp-Apim-Subscription-Key': 'e2e4286402cd4195ad6f8ac90ebdf9d4'
    }
  }).then(response => {
    if (response.status === 200) {
      var menuDays = response.data[0].menuDays
      var menuDayOne = menuDays[0].menuItems
      menuDayOne.forEach(menuItem => {
        if (menuItem.course == 'Main Line') {
          if (menuItem.meal === 'Breakfast') {
            REastBreakfast.push(menuItem.formalName)
          } else if (menuItem.meal === 'Lunch') {
            REastLunch.push(menuItem.formalName)
          } else if (menuItem.meal === 'Dinner') {
            REastDinner.push(menuItem.formalName)
          }
        }
      })
    }
  })

  var bluFlameMenu = []
  var marketMenu = []
  var monGrillMenu = []
  var tresHabMenu = []

  await axios({
    method: 'get',
    url:
      diningURL +
      daviesLocationID +
      '/' +
      today +
      '/' +
      today +
      '/' +
      daviesMenuID,
    headers: {
      'sodexo-accesscodes': '24TW3',
      'Ocp-Apim-Subscription-Key': 'e2e4286402cd4195ad6f8ac90ebdf9d4'
    }
  }).then(response => {
    if (response.status === 200) {
      menuItems = response.data[0].menuDays[0].menuItems
      menuItems.forEach(function(menuItem) {
        if (
          menuItem.course === 'Mongolian Noodle Bowl' ||
          menuItem.course === 'Mongolian Rice Bowl'
        ) {
          if (menuItem.planningGroupDescription !== 'MISC. ITEMS') {
            monGrillMenu.push(menuItem.formalName)
          }
        } else if (menuItem.course === 'Tres Habeneros') {
          if (menuItem.uomDescription === '1 ENTREE') {
            tresHabMenu.push(menuItem.formalName)
          }
        } else if (menuItem.course === 'Blu Flame Grill') {
          if (menuItem.planningGroupDescription === 'SAND-POULTRY (HOT)') {
            bluFlameMenu.push(menuItem.formalName)
          }
        } else if (menuItem.course === 'Blu Flame Breakfast') {
          if (menuItem.foodMainCategoryDescription === 'Mains') {
            bluFlameMenu.push('(Breakfast):' + menuItem.formalName)
          }
        } else {
          if (
            menuItem.course !== 'Blu Flame Homestyle Bar' &&
            menuItem.course !== 'Seasons Salad Bar' &&
            menuItem.planningGroupDescription !== 'SNACKS' &&
            menuItem.planningGroupDescription !== 'MISC. ITEMS' &&
            menuItem.planningGroupDescription !== 'Other'
          ) {
            marketMenu.push(menuItem.formalName)
          }
        }
      })
    }
  })

  var dulanyMenu = []
  await axios({
    method: 'get',
    url:
      diningURL +
      dulanyLocationID +
      '/' +
      today +
      '/' +
      today +
      '/' +
      dulanyMenuID,
    headers: {
      'sodexo-accesscodes': '24TW3',
      'Ocp-Apim-Subscription-Key': 'e2e4286402cd4195ad6f8ac90ebdf9d4'
    }
  }).then(response => {
    if (response.status === 200) {
      var menuItems = response.data[0].menuDays[0].menuItems
      menuItems.forEach(function(menuItem) {
        dulanyMenu.push(menuItem.formalName)
      })
    }
  })

  let data = await axios
    .get(foodURL)
    .then(response => {
      if (response.status === 200) {
        const html = response.data
        const $ = cheerio.load(html)
        let dining = []
        var diningIndex = -1

        var diningTables = [
          'section[id=sec-table-s]',
          'section[id=sec-table-s-5]'
        ]
        diningTables.forEach(function(table) {
          $(table)
            .children('table')
            .children('tbody')
            .children()
            .each((i, elm) => {
              $(elm)
                .children()
                .each((j, elm2) => {
                  var rawDiningName = $(elm2).text()
                  if (
                    rawDiningName !== '' &&
                    rawDiningName !== 'Riverview Cafe East' &&
                    rawDiningName !== 'Riverview Cafe'
                  ) {
                    if (j == 0) {
                      var diningName = rawDiningName
                        .trim()
                        .replace(/\xa0/g, '')
                        .replace(/ +/g, ' ')
                      diningIndex++
                      if (diningName === 'Breakfast') {
                        diningName = 'Riverview Cafe East - Breakfast'
                        dining[diningIndex] = {
                          menu: REastBreakfast
                        }
                      } else if (diningName === 'Lunch') {
                        diningName = 'Riverview Cafe East - Lunch'
                        dining[diningIndex] = {
                          menu: REastLunch
                        }
                      } else if (diningName === 'Dinner') {
                        diningName = 'Riverview Cafe East - Dinner'
                        dining[diningIndex] = {
                          menu: REastDinner
                        }
                      } else if (diningName === 'Blu Flame Grill') {
                        dining[diningIndex] = {
                          menu: bluFlameMenu
                        }
                      } else if (diningName === 'Tres Habeneros') {
                        dining[diningIndex] = {
                          menu: tresHabMenu
                        }
                      } else if (diningName === 'Mongolian Grill') {
                        dining[diningIndex] = {
                          menu: monGrillMenu
                        }
                      } else if (diningName === 'Marketplace') {
                        dining[diningIndex] = {
                          menu: marketMenu
                        }
                      } else if (diningName === 'The Dulany Inn') {
                        dining[diningIndex] = {
                          menu: dulanyMenu
                        }
                      } else {
                        dining[diningIndex] = {}
                      }
                      dining[diningIndex].hours = []
                      dining[diningIndex].name = diningName
                    } else if (j == 1) {
                      dining[diningIndex].hours.push(
                        'Monday: ' + $(elm2).text()
                      )
                    } else if (j == 2) {
                      dining[diningIndex].hours.push(
                        'Tuesday: ' + $(elm2).text()
                      )
                    } else if (j == 3) {
                      dining[diningIndex].hours.push(
                        'Wednesday: ' + $(elm2).text()
                      )
                    } else if (j == 4) {
                      dining[diningIndex].hours.push(
                        'Thursday: ' + $(elm2).text()
                      )
                    } else if (j == 5) {
                      dining[diningIndex].hours.push(
                        'Friday: ' + $(elm2).text()
                      )
                    } else if (j == 6) {
                      dining[diningIndex].hours.push(
                        'Saturday: ' + $(elm2).text()
                      )
                    } else if (j == 7) {
                      dining[diningIndex].hours.push(
                        'Sunday: ' + $(elm2).text()
                      )
                    }
                  }
                })
            })
        })
        return dining
      }
    })
    .then(response => {
      return response
    })
  return data
}

// Database section for use within UWEC App

// let laundryDB = async (parent, args, context, info) => {
//   // This method will need to be passed which laundry room its looking for
//   let id = parent
//   returnData = {
//     availWashers: 0,
//     availDryers: 0,
//     totalWashers: 0,
//     totalDryers: 0
//   }
//   await MongoClient.connect(mongoURL, function(err, db) {
//     if (err) throw err
//     let database = db.db('insert database name here')
//     database.collection('insert collection name here').findOne(
//       {
//         /*insert query here*/
//       },
//       function(err, result) {
//         if (err) throw err
//         returnData = {
//           availWashers: result.availWashers,
//           availDryers: result.availDryers,
//           totalWashers: result.totalWashers,
//           totalDryers: result.totalDryers
//         }
//         database.close()
//       }
//     )
//   })
//   return returnData
// }

module.exports = {
  getLaundry: getLaundry,
  getWeather: getWeather,
  getBus: getBus,
  getLaundryRoom: getLaundryRoom,
  getNews: getNews,
  getDining: getDining,
  setEmergencyAlert: setEmergencyAlert
}
