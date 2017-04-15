
var margin = {
  "left": 30,
  "right": 20,
  "bottom": 20,
  "top": 20
};

var width = 300;
var height = 200;

var svg = d3.select("#chart")
    .append("svg");

svg.attrs({
  "width": margin.left + width + margin.right,
  "height": height + margin.top + margin.bottom
});

var x_scale = d3.scaleLinear()
    .domain([0, 1])
    .range([margin.left, width - margin.right]);

var y_scale = d3.scaleLinear()
    .domain([0, 1])
    .range([height - margin.top, margin.bottom]);

var x_axis = d3.axisBottom()
    .ticks(2)
    .scale(x_scale);
var y_axis = d3.axisLeft()
    .ticks(2)
    .scale(y_scale);

svg.append("g")
  .attrs({
    "class": "x axis",
    "transform": "translate(" + 0 + "," + height + ")"
  })
  .call(x_axis);

svg.append("g")
  .attrs({
    "class": "y axis",
    "transform": "translate(" + margin.left + ",0)"
  })
  .call(y_axis);

var data = [];
for (var i = 0; i < 100; i++) {
  data.push({
    "x": Math.random(),
    "y": Math.random()
  });
}

svg.selectAll(".sample")
  .data(data)
  .enter()
  .append("circle")
  .attrs({
    "class": "sample",
    "cx": function(d) { return x_scale(d.x); },
    "cy": function(d) { return y_scale(d.y); },
    "r": 0.5,
    "fill": "black"
  });
