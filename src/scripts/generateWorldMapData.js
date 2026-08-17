const fs = require('fs');
const path = require('path');
const { feature } = require('topojson-client');
const world = require('world-atlas/countries-110m.json');
const d3 = { ...require('d3-geo'), ...require('d3-geo-projection') };

const width = 800;
const height = 450;

const projection = d3.geoRobinson().fitSize([width, height], { type: 'Sphere' });
const pathGenerator = d3.geoPath(projection);

const sphere = { type: 'Sphere' };
const land = feature(world, world.objects.land);
const countries = feature(world, world.objects.countries);
const graticule = d3.geoGraticule10();

const spherePath = pathGenerator(sphere);
const graticulePath = pathGenerator(graticule);
const landPath = pathGenerator(land);
const countryPaths = countries.features.map(f => ({
  id: f.id,
  path: pathGenerator(f)
})).filter(c => c.path);

const output = {
  width,
  height,
  spherePath,
  graticulePath,
  landPath,
  countryPaths
};

const outputPath = path.join(__dirname, '../data/worldMapData.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('Successfully generated real Robinson world map vector data at:', outputPath);
