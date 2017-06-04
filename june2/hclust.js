
var root = d3.stratify()
    .id(function(d) { return d.id; })
    .parentId(function(d) { return d.parent; })(tree);

function depths(root) {
  if (root.parent === null) {
    root.data.depth = 0;
  } else {
    root.data.depth = root.parent.data.depth + root.data.edge_length;
  }

  if (Object.keys(root).indexOf("children") == -1) {
    return;
  } else {
    for (var i = 0; i < root.children.length; i++) {
      depths(root.children[i]);
    }
  }
}

var elem_height = 700;
var elem_width = 1200;
var elem = d3.select("#vis")
    .append("svg")
    .attrs({
      "width": elem_width,
      "height": elem_height
    });

elem.append("rect")
  .attrs({
    "fill": "#F8F8F8",
    "width": elem_width,
    "height": elem_height
  });

d3.cluster()(root);
var coords = {
  "x": root.descendants().map(function(d) { return d.data.x; }),
  "y": root.descendants().map(function(d) { return d.data.y; })
};
var rows = data.map(function(d) { return d.row; });
rows = d3.set(rows).values();
var fill_vals = data.map(function(d) { return d.value; });

var scales = {
  "tile_y": d3.scaleBand()
    .domain(rows)
    .range([elem_height / 5, elem_height]),
  "tile_fill": d3.scaleLinear()
    .domain(d3.extent(fill_vals))
    .range(["#f8f8f8", "black"]),
  "tree_x": d3.scaleLinear()
    .domain(d3.extent(coords.x))
    .range([0, elem_width]),
  "tree_y": d3.scaleLinear()
    .domain(d3.extent(coords.y))
    .range([elem_height / 5 - 10, 0])
};

elem.selectAll(".hcnode")
  .data(root.descendants(), function(d) { return d.id; }).enter()
  .append("circle")
  .attrs({
    "class": "hcnode",
    "cx": function(d) { return scales.tree_x(d.data.x); },
    "cy": function(d) { return scales.tree_y(d.data.y); }
  });

var link_fun = d3.linkVertical()
    .x(function(d) { return scales.tree_x(d.data.x); })
    .y(function(d) { return scales.tree_y(d.data.y); });

elem.selectAll(".link")
  .data(root.links()).enter()
  .append("path")
  .attrs({
    "class": "link",
    "d": link_fun
  });

elem.selectAll(".tile")
  .data(data).enter()
  .append("rect")
  .attrs({
    "class": "tile",
    "x": function(d) { return scales.tree_x(d.x); },
    "y": function(d) { return scales.tile_y(d.row); },
    "width": 100,
    "height": scales.tile_y.bandwidth(),
    "fill": function(d) { return scales.tile_fill(d.value); }
  });
