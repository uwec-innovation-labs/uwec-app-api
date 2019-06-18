const axios = require('axios')

const weatherData = async () => {
  await axios({
    url: 'http://35.247.62.2:4000/graphql',
    method: 'post',
    data: {
      query: `
          {
            weather {
              degrees
              status
              precipitation
            }
          }
          `
    }
  }).then(result => {
    //todo: Write to database
  })
}

const laundryData = async () => {
  await axios({
    url: 'http://35.247.62.2:4000/graphql',
    method: 'post',
    data: {
      query: `
            {
                laundryRoom(building: "${laundry}") {
                    totalNumDryers
                    totalNumWashers 
                    dryersAvailable
                    washersAvailable
                }
            }
        `
    }
  }).then(result => {
    //todo: write to database
  })
}

const spectatorData = async () => {
  await axios({
    url: 'http://35.247.62.2:4000/graphql',
    method: 'post',
    data: {
      query: `
          {
            news {
              title
              image
              link
            }
          }
          `
    }
  }).then(result => {
    //todo: write to database
  })
}

//setInterval(weatherData, 30 * 60000) // Get weather every 30 min

//setInterval(laundryData, 60000) // Get laundry data every 1 min

//setInterval(spectatorData, 1440 * 60000) // Get spectator stories every 24 hours
