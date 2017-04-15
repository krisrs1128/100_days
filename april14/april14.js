
var margin = {
  "left": 30,
  "right": 20,
  "bottom": 20,
  "top": 20
};

var width = 300 - margin.left - margin.right;
var height = 200 - margin.top - margin.bottom;

var svg = d3.select("#chart")
    .append("svg")
    .attrs({
      "width": margin.left + width + margin.right,
      "height": height + margin.top + margin.bottom
    });

var wrapper = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x_scale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]);

var y_scale = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

var x_axis = d3.axisBottom()
    .ticks(2)
    .scale(x_scale);
var y_axis = d3.axisLeft()
    .ticks(2)
    .scale(y_scale);

wrapper.append("g")
  .attrs({
    "class": "x axis",
    "transform": "translate(" + 0 + "," + height + ")"
  })
  .call(x_axis);

wrapper.append("g")
  .attrs({"class": "y axis"})
  .call(y_axis);

var data = [];
for (var i = 0; i < 100; i++) {
  data.push({
    "x": Math.random(),
    "y": Math.random()
  });
}

wrapper.selectAll(".sample")
  .data(data)
  .enter()
  .append("circle")
  .attrs({
    "class": function(d, i) { return "sample" + i; },
    "cx": function(d) { return x_scale(d.x); },
    "cy": function(d) { return y_scale(d.y); },
    "r": 0.5,
    "fill": "black"
  });

var voronoi = d3.voronoi()
    .x(function(d) { return x_scale(d.x); })
    .y(function(d) { return y_scale(d.y); })
    .extent([[0, 0], [width, height]]);

wrapper.selectAll("path")
  .data(voronoi(data).polygons())
  .enter()
  .append("path")
  .attr("d", function(d, i) { return "M" + d.join("L") + "Z"; })
  .datum(function(d, i) { return d.point; })
  .attrs({
    "class": function(d, i) { return "voronoi" + i; },
    "fill": "none",
    "stroke": "#2074A0"
  })
  .style("pointer-events", "all")
  .on("mouseover", show_tooltip)
  .on("mouseout", remove_tooltip);

///////////////////////////////////////////////////////////////////////////////
// Show / hide tooltip
///////////////////////////////////////////////////////////////////////////////

function remove_tooltip(d) {
  d3.select(this)
    .transition()
    .duration(500)
    .style("r", 0.5);
  $(".popover").each(function() {
    $(this).remove();
  });
}

function show_tooltip(d) {
  $(this).popover({
    placement: "auto top",
    container: "#chart",
    trigger: "manual",
    html: true,
    content: function() {
      return "<span style='font-size': 11px; text-align: center;'>hi</span>"
    }
  });

  $(this).popover("show");
  d3.select(this)
    .transition()
    .duration(500)
    .style("r", 2.5);
}
