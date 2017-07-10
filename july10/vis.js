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

elem.append("g")
  .attr("id", "mouseover_text");


var brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("brush", brushed);
elem.append("g")
  .attr("class", "brush")
  .call(brush);

var data = [];
for (var i = 0; i < 100; i++) {
  data.push({
    "x": Math.round(1000 * Math.random(), 5) / 1000,
    "y": Math.round(1000 * Math.random(), 5) / 1000
  });
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
  })
  .on("mouseover", mouseover_fun);

function mouseover_fun(d) {
  d3.select("#mouseover_text text")
    .attrs({
      "opacity": 1,
      "transform": "translate(" + scales.x(d.x) + "," + scales.y(d.y) + ")"
    })
    .text(d.x + ", " + d.y);
}

function brushed() {
  var cur_select = d3.event.selection;
  var x_low = scales.x.invert(cur_select[0][0], cur_select[0][1]);
  var y_low = scales.x.invert(cur_select[1][0], cur_select[1][1]);

  elem.selectAll(".circle")
    .attrs({
      "fill": function(d) {
        if (d.x < scales.x.invert(cur_select[0][0])) {
          return "black";
        } else if (d.x > scales.x.invert(cur_select[1][0])) {
          return "black";
        } else if (d.y < scales.y.invert(cur_select[0][1])) {
          return "black";
        } else if (d.y > scales.y.invert(cur_select[1][1])) {
          return "black";
        } else {
          return "red";
        }
      }
    });

}
