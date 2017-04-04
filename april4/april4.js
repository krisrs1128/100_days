var width = 700,
    height = 580;
var svg = d3.select( "body" )
    .append( "svg" )
    .attr( "width", width )
    .attr( "height", height );

var tracts = svg.append( "g" )
    .attr( "id", "tracts" );
var proj = d3.geoAlbers();
var testProj = proj.fitSize([width, height], census_tracts_json)

var geoPath = d3.geoPath()
    .projection(testProj);

var county_cols = d3.scaleOrdinal()
    .domain(["Alameda County", "Contra Costa County", "Santa Clara County", "Solano County"])
    .range(["green", "orange", "blue", "purple"]);

d3.select("#tracts")
  .selectAll("path")
  .data(census_tracts_json.features)
  .enter()
  .append("path")
  .attrs({
    "d": geoPath,
    "fill": function(d) { return county_cols(d.properties.county); }
  });
