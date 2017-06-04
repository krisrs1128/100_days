
var root = d3.stratify()
    .id(function(d) { return d.id; })
    .parentId(function(d) { return d.parent; })(tree);

var elem_height = 350;
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

// Build scales
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
    .range([0, 0.6 * elem_width]),
  "tree_y": d3.scaleLinear()
    .domain(d3.extent(coords.y))
    .range([elem_height / 5 - 10, 0]),
  "centroid_x": d3.scaleBand()
    .domain(rows)
    .range([0.61 * elem_width, elem_width]),
  "centroid_y": d3.scaleLinear()
    .domain(d3.extent(fill_vals))
    .range([elem_height, 0])
};

// Draw the tree
elem.selectAll(".hcnode")
  .data(root.descendants(), function(d) { return d.id; }).enter()
  .append("circle")
  .attrs({
    "class": "hcnode",
    "fill": "#555",
    "cx": function(d) { return scales.tree_x(d.data.x); },
    "cy": function(d) { return scales.tree_y(d.data.y); }
  })
  .on("mouseover", function(d) {
    var cur_tree = subtree(root, d.id);
    update_heatmap_focus(elem, cur_tree, scales.tree_x);
    update_tree_focus(elem, cur_tree, scales.tree_x);
    update_data_focus(elem, cur_tree, scales.tree_x);
  });

var link_fun = d3.linkVertical()
    .x(function(d) { return scales.tree_x(d.data.x); })
    .y(function(d) { return scales.tree_y(d.data.y); });

elem.selectAll(".link")
  .data(root.links()).enter()
  .append("path")
  .attrs({
    "class": "link",
    "stroke": "#555",
    "d": link_fun
  });

// Draw the heatmap
var bandwidth = scales.tree_x.range()[1] / (scales.tree_x.domain()[1] - scales.tree_x.domain()[0]);
elem.selectAll(".tile")
  .data(data).enter()
  .append("rect")
  .attrs({
    "class": "tile",
    "x": function(d) { return scales.tree_x(d.x); },
    "y": function(d) { return scales.tile_y(d.row); },
    "width": bandwidth,
    "height": scales.tile_y.bandwidth(),
    "fill": function(d) { return scales.tile_fill(d.value); }
  });

elem.append("rect")
  .attrs({"class": "hm_focus"});

var test_line = d3.line()
    .x(function(d) {
      return scales.centroid_x(d.row); })
    .y(function(d) {
      return scales.centroid_y(d.value); });

// draw the centroids
elem.selectAll(".data_focus")
  .data(ts_data).enter()
  .append("path")
  .attrs({
    "class": "data_focus",
    "stroke-opacity": 0.2,
    "stroke-width": 0.2,
    "stroke": "#555"
  })
  .attr("d", test_line);
