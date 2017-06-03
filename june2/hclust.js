
var root = d3.stratify()
    .id(function(d) { return d.child; })
    .parentId(function(d) { return d.id; })(tree);

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
var elem_width = 1000;
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

var scales = {
  "x": d3.scaleLinear()
    .domain(d3.extent(coords.x))
    .range([0, elem_width]),
  "tree_y": d3.scaleLinear()
    .domain(d3.extent(coords.y))
    .range([elem_height / 2, 0])
};

elem.selectAll(".node")
  .data(root.descendants()).enter()
  .append("circle")
  .attrs({
    "class": "node",
    "cx": function(d) { return scales.x(d.data.x); },
    "cy": function(d) { return scales.tree_y(d.data.y); }
  });

elem.selectAll(".link")
  .data(root.links())
  .enter().append("path")
  .attrs({
    "class": "link",
    "d": d3.linkVertical()
      .x(function(d) { return scales.x(d.data.x); })
      .y(function(d) { return scales.tree_y(d.data.y); })
  });
