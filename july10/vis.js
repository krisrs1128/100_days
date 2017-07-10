/**
 * Mouseovers with brushing
 *
 * This is an experiment based on the comments in
 *
 * https://github.com/d3/d3/issues/1604
 *
 * author: sankaran.kris@gmail.com
 * date: 7/10/2017
 */

var width = 500;
var height = 500;
var elem = d3.select("body")
    .append("svg")
    .attrs({
      "width": width,
      "height": height
    });

var data = [];
for (var i = 0; i < 100; i++) {
  data.push({"x": Math.random(), "y": Math.random()});
}

var scales = {
  "x": d3.scaleLinear()
    .domain([0, 1])
    .range([0, width]),
  "y": d3.scaleLinear()
    .domain([0, 1])
    .range([0, height])
};

elem.selectAll(".circle")
  .data(data).enter()
  .append("circle")
  .attrs({
    "class": "circle",
    "cx": function(d) { return scales.x(d.x); },
    "cy": function(d) { return scales.y(d.y); },
    "r": 5,
    "fill": "black"
  });
