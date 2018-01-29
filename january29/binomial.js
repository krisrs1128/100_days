/**
 *
 * author: sankaran.kris@gmail.com
 * date: 01/29/2018
 **/

var opts = {
  "elem_width": 200,
  "elem_height": 200,
  "radius": 10,
  "circle_y": 50
};

var elem = d3.select("#vis")
    .append("svg")
    .attrs({
      "width": opts.elem_width,
      "height": opts.elem_height
    });

elem.append("rect")
  .attrs({
    "fill": "#F8F8F8",
    "width": opts.elem_width,
    "height": opts.elem_height
  });

function flip_coin(p) {
  if (Math.random() < p) {
    return true;
  }
  return false;
}


var n = 20;
var n_rows = 1;
var scales = {
  "circle_x": d3.scaleLinear().domain([0, n + 1]).range([0, opts.elem_width]),
  "circle_y": d3.scaleLinear().domain([0, n_rows]).range([0, opts.elem_height / 2])
};

coins = [];
counter = 0;
p = 0.5;

function update_coins() {
  coins = coins.concat({
    "outcome": flip_coin(p),
    "row": n_rows
  });

  elem.selectAll(".coin")
    .data(coins)
    .enter()
    .append("circle")
    .classed("coin", true)
    .attrs({
      "cx": function(d, i) { return scales.circle_x(i % n);},
      "r": d3.min([opts.elem_width / (1 + 2 * n), opts.elem_height / (2 * (1 + 2 * n_rows))]),
      "cy": function(d) { return scales.circle_y(d.row); },
      "fill": function(d) { if (d.outcome) { return "#779894"; } return "#98777b"; }
    });

  elem.selectAll(".coin")
    .transition()
    .attrs({
      "r": d3.min([opts.elem_width / (1 + 2 * n), opts.elem_height / (2 * (1 + 2 * n_rows))]),
      "cy": function(d) { return scales.circle_y(d.row); }
    });

  counter = (counter + 1) % n;
  if (counter == 0) {
    n_rows++;
    scales.circle_y.domain([0, n_rows]);
  }
}

d3.interval(update_coins, 100)
