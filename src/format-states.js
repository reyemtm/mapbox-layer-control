const fs = require("fs");
const format = require("date-format");

// const states = JSON.parse(fs.readFileSync("./example/states.json"))
// // const date = new Date(states[0].date_joined)
// // console.log({date: states[0].date_joined, custom: date});
// console.log(format("MM/dd/yyyy", new Date(states[0].date_joined)))

// const newStates = [];
// states.map(s => {
//   s.date_joined_formatted = format("MM/dd/yyyy", new Date(s.date_joined));
//   newStates.push(s)
// });

// // fs.writeFileSync("example/states_joined_union.json", JSON.stringify(newStates,0,2))
const statesJson = JSON.parse(fs.readFileSync("example/states_joined_union.json"));
// statesJson.map(s => {
//   s["date_entered"] = format("yyyy/MM/dd", new Date(s.date_joined))
// })
// fs.writeFileSync("example/states_joined_union.json", JSON.stringify(statesJson,0,2));
// process.exit()
const geojson = JSON.parse(fs.readFileSync("example/states.geojson"));

const newGeoJSON = {
  type: "FeatureCollection",
  features: []
}

const props = [
  "st_name",
  "date_joined",
  "joined_name",
  "st_abbr",
  "fips",
  "date_entered"
]

geojson.features.map(f => {
  const fips = f.properties.STATE
  statesJson.map(s => {
    if (s.fips == fips) {
      Object.keys(s).forEach(k => {
        if (!f.properties[k] && props.includes(k)) {
          f.properties[k] = s[k]
        }
      })
    }
  });
  newGeoJSON.features.push(f)
});

fs.writeFileSync("example/states.geojson", JSON.stringify(newGeoJSON,0,2))