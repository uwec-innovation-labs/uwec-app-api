const request = require('request-promise')
const axios = require('axios')
const cheerio = require('cheerio')
const newsURL = 'https://www.spectatornews.com/'
const foodURL = 'https://www.uwec.edu/campus-life/housing-dining/dining/food-services/dining-hours/'
require("dotenv").config()

const diningURL = 'https://bite-external-api.azure-api.net/extern/'
const myHeaders = {
  "sodexo-accesscodes": process.env.PASSCODE,
  "Ocp-Apim-Subscription-Key": process.env.SUB_KEY,
}
const hilltopLocationID = "84956001";
const hilltopMenuID = "14916";
const daviesLocationID = "84956004";
const daviesMenuID = "24TW3";
const dulanyLocationID = "84956010";
const dulanyMenuID = "14843";

async function getLaundry(parent, args, context, info) {
  var machineID = parent.id;
  //make the api call to get data
  var machineData = [];
  var laundry = [];

  machineData.forEach(function(machine) {
    //may need to filter out vending machines?
    if (machineID === undefined || machine.MACHINENUM === machineID) {
      var newMachine = {};
      newMachine.user = data.CARDNUM;
      newMachine.id = data.MACHINENUM;
      newMachine.jobNumber = data.TRANSEQNUM;
      newMachine.startTime = data.ACTUALDATETIME;
      //or POSTDATETIME?
      //can use date.now to calculate remaining time if we hardcode in total time
      laundry.push(newMachine);
    }
  });

  return laundry
}

// Function to grab laundry room data - dummy data
async function getLaundryRoom(parent, args, context, info) {
  // Return laundryRoom with dummy data for the stats of the room
  var laundryRoom = {
    id: parent.building,
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
  var todayTime = new Date();
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  return month + "-" + day;
}

async function getNutrition(parent, args, context, info) {
  var foodNumber = parent.number;
  var uomID = parent.uomID;
  var nutrition = {};
  await axios({
    method: 'get',
    url: diningURL + "fooditems/" + foodNumber + "/" + uomID, 
    headers: myHeaders
  })
  .then(response => {
    if (response.status === 200) {
      nutrition.name = response.data.formalName;
      nutrition.description = response.data.description;
      nutrition.ingredients = response.data.requestedUOM.listOfIngredients;
      nutrition.vegetarian = response.data.isVegetarian;
      nutrition.vegan = response.data.isVegan;
      nutrition.calories = response.data.requestedUOM.displayCalories;
      nutrition.caloriesFromFat = response.data.requestedUOM.displayCaloriesFromFat;
      nutrition.fat = response.data.requestedUOM.displayFat;
      nutrition.saturatedFat = response.data.requestedUOM.displaySaturatedFat;
      nutrition.transFat = response.data.requestedUOM.displayTransFat;
      nutrition.cholesterol = response.data.requestedUOM.displayCholesterol;
      nutrition.sodium = response.data.requestedUOM.displaySodium;
      nutrition.sugar = response.data.requestedUOM.displaySugar;
      nutrition.fiber = response.data.requestedUOM.displayDietaryFiber;
      nutrition.iron = response.data.requestedUOM.displayIron;
      nutrition.protein = response.data.requestedUOM.displayProtein;
      nutrition.carbohydrates = response.data.requestedUOM.displayCarbohydrates;
      nutrition.allergens = [];
      if (response.data.requestedUOM.milkAllergen) {
        nutrition.allergens.push("Milk")
      }
      if (response.data.requestedUOM.eggsAllergen) {
        nutrition.allergens.push("Eggs")
      }
      if (response.data.requestedUOM.fishAllergen) {
        nutrition.allergens.push("Fish")
      }
      if (response.data.requestedUOM.shellfishAllergen) {
        nutrition.allergens.push("Shellfish")
      }
      if (response.data.requestedUOM.wheatAllergen) {
        nutrition.allergens.push("Wheat")
      }
      if (response.data.requestedUOM.peanutAllergen) {
        nutrition.allergens.push("Peanuts")
      }
      if (response.data.requestedUOM.treenutsAllergen) {
        nutrition.allergens.push("Tree Nuts")
      }
      if (response.data.requestedUOM.soybeanAllergen) {
        nutrition.allergens.push("Soybeans")
      }
      if (response.data.requestedUOM.glutenAllergen) {
        nutrition.allergens.push("Gluten")
      }
      if (response.data.requestedUOM.msgAllergen) {
        nutrition.allergens.push("MSG")
      }
      if (response.data.requestedUOM.mustardAllergen) {
        nutrition.allergens.push("Mustard")
      }
      if (response.data.requestedUOM.celeryAllergen) {
        nutrition.allergens.push("Celery")
      }
      if (response.data.requestedUOM.crustaceansAllergen) {
        nutrition.allergens.push("Crustaceans")
      }
      if (response.data.requestedUOM.lupinAllergen) {
        nutrition.allergens.push("Lupin")
      }
      if (response.data.requestedUOM.molluscsAllergen) {
        nutrition.allergens.push("Moluscs")
      }
      if (response.data.requestedUOM.nutsAllergen) {
        nutrition.allergens.push("Nuts")
      }
      if (response.data.requestedUOM.sesameSeedsAllergen) {
        nutrition.allergens.push("Sesame Seeds")
      }
      if (response.data.requestedUOM.sulphitesAllergen) {
        nutrition.allergens.push("Sulphites")
      }
    }
  });

  return nutrition;
}

function getMenuItem(menuItem) {
  var newMenuItem = {};
  newMenuItem.name = menuItem.formalName;
  newMenuItem.uomID = menuItem.uomId;
  newMenuItem.number = menuItem.number;
  return newMenuItem;
}

async function getDining(parent, args, context, info) {
  var today = GetFormattedDate();
  var REastBreakfast = [];
  var REastLunch = [];
  var REastDinner = [];

  await axios({
    method: 'get',
    url: diningURL + "menus/" + hilltopLocationID + "/" + today + "/" + today + "/" + hilltopMenuID,
    headers: myHeaders
  })
  .then(response => {
    if (response.status === 200) {
      var menuDays = response.data[0].menuDays;
      var menuDayOne = menuDays[0].menuItems;
      menuDayOne.forEach((menuItem) => {
        if (menuItem.course == "Main Line") {
          if (menuItem.meal === "Breakfast") {
            REastBreakfast.push(getMenuItem(menuItem));
          } else if (menuItem.meal === "Lunch") {
            REastLunch.push(getMenuItem(menuItem));
          } else if (menuItem.meal === "Dinner") {
            REastDinner.push(getMenuItem(menuItem));
          }
        }
      });
    }
  });

  var bluFlameMenu = [];
  var marketMenu = [];
  var monGrillMenu = [];
  var tresHabMenu = [];

  await axios({
    method: 'get',
    url: diningURL + "menus/" + daviesLocationID + "/" + today + "/" + today + "/" + daviesMenuID,
    headers: myHeaders,
    timeout: 1000
  })
  .then(response => {
    if (response.status === 200) {
      menuItems = response.data[0].menuDays[0].menuItems;
      menuItems.reduce(async(promise, menuItem) => {
        if (menuItem.course === "Mongolian Noodle Bowl" || menuItem.course === "Mongolian Rice Bowl") {
          if (menuItem.planningGroupDescription !== "MISC. ITEMS") {
            monGrillMenu.push(getMenuItem(menuItem));
          }
        } else if (menuItem.course === "Tres Habeneros") {
          if (menuItem.uomDescription === "1 ENTREE") {
            tresHabMenu.push(getMenuItem(menuItem));
          }
        } else if (menuItem.course === "Blu Flame Grill") {
          if (menuItem.planningGroupDescription === "SAND-POULTRY (HOT)") {
            bluFlameMenu.push(getMenuItem(menuItem));
          }
        } else if (menuItem.course === "Blu Flame Breakfast") {
          if (menuItem.foodMainCategoryDescription === "Mains") {
            //fix to add 'breakfast' distinction
            bluFlameMenu.push(getMenuItem(menuItem));
          }
        } else {
          if (menuItem.course !== "Blu Flame Homestyle Bar" && menuItem.course !== "Seasons Salad Bar" && menuItem.planningGroupDescription !== "SNACKS" && menuItem.planningGroupDescription !== "MISC. ITEMS" && menuItem.planningGroupDescription !== "Other") {
            marketMenu.push(getMenuItem(menuItem));
          }
        }
      }, Promise.resolve());
    }
  });

  var dulanyMenu = [];
  await axios({
  method: 'get',
  url: diningURL + "menus/" + dulanyLocationID + "/" + today + "/" + today + "/" + dulanyMenuID,
  headers: myHeaders
  })
  .then(response => {
    if (response.status === 200) {
      var menuItems = response.data[0].menuDays[0].menuItems;
      menuItems.forEach(function(menuItem) {
        dulanyMenu.push(getMenuItem(menuItem));
      });
    }
  });

  let data = await axios
  .get(foodURL)
  .then(response => {
    if (response.status === 200) {
      const html = response.data
      const $ = cheerio.load(html)
      let dining = [];
      var diningIndex = -1;

      var diningTables = ["section[id=sec-table-s]", "section[id=sec-table-s-5]"];
      diningTables.forEach(function(table) {
        $(table).children('table').children('tbody').children().each((i, elm) => {
          $(elm).children().each((j, elm2) => {
            var rawDiningName = $(elm2).text();
            if ((rawDiningName !== "") && (rawDiningName !== "Riverview Cafe East") && (rawDiningName !== "Riverview Cafe")) {
              if (j == 0) {
                var diningName = rawDiningName.trim().replace(/\xa0/g, "").replace(/ +/g, " ");
                diningIndex++;
                if (diningName === "Breakfast") {
                  diningName = "Riverview Cafe East - Breakfast";
                  dining[diningIndex] = {
                    menu: REastBreakfast
                  }
                } else if (diningName === "Lunch") {
                  diningName = "Riverview Cafe East - Lunch";
                  dining[diningIndex] = {
                    menu: REastLunch
                  }
                } else if (diningName === "Dinner") {
                  diningName = "Riverview Cafe East - Dinner";
                  dining[diningIndex] = {
                    menu: REastDinner
                  }
                } else if (diningName === "Blu Flame Grill") {
                  dining[diningIndex] = {
                    menu: bluFlameMenu
                  }
                } else if (diningName === "Tres Habeneros") {
                  dining[diningIndex] = {
                    menu: tresHabMenu
                  }
                } else if (diningName === "Mongolian Grill") {
                  dining[diningIndex] = {
                    menu: monGrillMenu
                  }
                } else if (diningName === "Marketplace") {
                  dining[diningIndex] = {
                    menu: marketMenu
                  }
                } else if (diningName === "The Dulany Inn") {
                  dining[diningIndex] = {
                    menu: dulanyMenu
                  }
                } else {
                  dining[diningIndex] = {};
                }
                dining[diningIndex].hours = [];
                dining[diningIndex].name = diningName;
              } else if (j == 1) {
                dining[diningIndex].hours.push("Monday: " + $(elm2).text());
              } else if (j == 2) {
                dining[diningIndex].hours.push("Tuesday: " + $(elm2).text());
              } else if (j == 3) {
                dining[diningIndex].hours.push("Wednesday: " + $(elm2).text());
              } else if (j == 4) {
                dining[diningIndex].hours.push("Thursday: " + $(elm2).text());
              } else if (j == 5) {
                dining[diningIndex].hours.push("Friday: " + $(elm2).text());
              } else if (j == 6) {
                dining[diningIndex].hours.push("Saturday: " + $(elm2).text());
              } else if (j == 7) {
                dining[diningIndex].hours.push("Sunday: " + $(elm2).text());
              }
            }
          });
        });
      });
      return dining;
    }
  })
  .then(response => {
    return response
  });
  return data;
}

module.exports = {
  getLaundry: getLaundry,
  getWeather: getWeather,
  getBus: getBus,
  getLaundryRoom: getLaundryRoom,
  getNews: getNews,
  getDining: getDining,
  getNutrition: getNutrition
}
