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

-bus tracking: uses DoubleMap API to get bus, route, stop, and eta data
    There are many different ways to arrange this data, since there it is largely many-to-many relationships.
    I've supplied a few different ways to view the data, and while they CAN all be used at once, this would result in a lot of redundant data and is probably not necessary. All of the bus data is wrapped under the 'bus_data' query, which can return 'buses', 'routes', and/or 'stops'
    note: in order to return 'buses', an array of buses must be given as a parameter (see example below). If you want all the buses, you need to list each one individually. This is in order to limit obsolete calls to the database and improve speed.

    'buses' example: this query will get the information for busses 503 and 507
        {
            bus_data (buses:[503,507]) {
                buses {
                    name
                    id
                    lat
                    lon
                    heading
                }
            }
        }

    'routes' example: this query will get the name, path (an array of lat/long coordinates), and stops of one or more bus routes
    note: notice that this query returns stops. if you do not define an array of stops as a parameter, then the only information that will be returned for each stop is the stopID. There are tons of stops along a route and it would take super long to generate the name and ETA of each stop.
    If you want information on JUST stops, save us both some time and just use the 'stops' array. It'll give you the route id there anyway.

    {
        bus_data(routes:[18]) {
            routes {
                id
                name
                path
                stops {
                    id
                }
            }
        }
    }


    'stops' example: this query will get the name and ETA's for stops 30 and 69
    note: for ETA's, 'avg' is the predicted amount of time it will take for the bus to get to the stop, in minutes
    {
        bus_data(stops: [30,69]) {
            stops {
                id
                name
                etas {
                    avg
                    bus_id
                    route
                }
            }
        }
    }

        