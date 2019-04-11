Run 'npm start' in this folder, then open "http://localhost:4000/graphql" in browser

Available queries:
-a laundry prototype: requires a laundry machine ID (a number) and returns that ID and the time remaining on the machine (another number)
    example: (type the following into the graphql interface in your browser)
        query {
            laundry(id:1) {
                id
                timeRemaining
            }
        }
    
-weather: uses Dark Sky weather API to get current temperature, precipitation, and conditions
    note: Dark Sky allows 1000 calls a day under the free membership
    example:
        query {
            weather {
                degrees
                precipitation
                status
            }
        }

-bus tracking
    example: 
        query {
            bus_data {
                buses {
                    name
                    id
                    lat
                    lon
                    heading
                }
                routes {
                    name
                    id
                    stops
                    path
                }
            }
        }