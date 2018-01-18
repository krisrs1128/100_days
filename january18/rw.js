/**
 *
 * author: sankaran.kris@gmail.com
 * date: //2018
 **/

// create margins using margin convention
// https://bl.ocks.org/mbostock/3019563
var margin = {top: 0, right: 0, bottom: 0, left: 0};
var opts = {
  "elem_width": 200,
  "elem_height": 200,
  "delta": 10,
  "radius": 4
};

// Create background rectangle
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

d3.timer(animate, 2000);

circles = [
  {
    "r": opts.radius,
    "index": 0,
    "x": opts.elem_width / 2,
    "y": opts.elem_height / 2
  }
];

function add_modulo(x, h) {
  var proposal = x;
  if (x < 0) {
    proposal += h;
  } else if (x > h) {
    proposal %= h;
  }
  return proposal;

}

function animate(elapsed) {
  for(var i = 0; i < circles.length; i++) {
    circles[i].r *= 0.99;
  }
  circles = circles.filter(
    function(d) {
      return d.r > 1;
    }
  );

  var last_circle = circles[circles.length - 1];
  circles.push({
    "index": last_circle.index + 1,
    "r": opts.radius,
    "x": last_circle.x + (Math.random() - 0.5) * opts.delta,
    "y": last_circle.y + (Math.random() - 0.5) * opts.delta
  });

  var circles_elem = svg_elem.selectAll("circle")
      .data(circles);

  circles_elem.enter()
    .append("circle");
  circles_elem.exit().remove();

  circles_elem.attrs({
    "cx": function(d) { return add_modulo(d.x, opts.elem_width); },
    "cy": function(d) { return add_modulo(d.y, opts.elem_height); },
    "fill": "black",
    "r": function(d) { return d.r; }
  });
}
