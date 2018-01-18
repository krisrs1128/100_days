/**
 *
 * author: sankaran.kris@gmail.com
 * date: //2018
 **/

// create margins using margin convention
// https://bl.ocks.org/mbostock/3019563
var margin = {top: 20, right: 10, bottom: 20, left: 10};
var opts = {
  "elem_width": 200,
  "elem_height": 200,
  "delta": 1,
  "radius": 2
}

var svg_elem = d3.select("#vis")
    .append("svg")
    .attrs({
      "width": opts.elem_width,
      "height": opts.elem_height
    });

svg_elem.append("rect")
  .attrs({
    "fill": "#F8F8F8",
    "width": opts.elem_width,
    "height": opts.elem_height
  });
var elem = svg_elem.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
opts.elem_width = opts.elem_width - margin.right - margin.left;
opts.elem_height = opts.elem_height - margin.top - margin.bottom;
