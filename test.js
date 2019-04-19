const { createApolloFetch } = require('apollo-fetch')
let currentTemp
const fetch = createApolloFetch({
  uri: 'http://localhost:4000/'
})
fetch({
  query: '{bus_data(buses: [514]) {buses {name id lat lon heading } } }'
}).then(res => {
  console.log(res.data)
})
console.log(busInfo)
// // You can also easily pass variables for dynamic arguments
// fetch({
//   query: `query PostsForAuthor($id: Int!) {
//     author(id: $id) {
//       firstName
//       posts {
//         title
//         votes
//       }
//     }
//   }`,
//   variables: { id: 1 }
// }).then(res => {
//   console.log(res.data)
// })
