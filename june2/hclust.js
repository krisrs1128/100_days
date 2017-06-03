
var root = d3.stratify()
    .id(function(d) { return d.child; })
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

var elem = d3.select("#vis")
    .append("svg")
    .attrs({
      "width": 1000,
      "height": 1000
    });

elem.append("rect")
  .attrs({
    "fill": "#F8F8F8",
    "width": 1000,
    "height": 1000
  });

d3.cluster()(root);
depths(root);

var ids = root.descendants().map(function(d) { return d.id; });
var leaf_depths = root.leaves().map(function(d) { return d.data.depth; });

var scales = {
  "x": d3.scaleBand()
    .domain(ids)
    .range([0, 1000]),
  "y": d3.scaleLinear()
    .domain([0, d3.max(leaf_depths)])
    .range([0, 1000])
};

elem.selectAll(".node")
  .data(root.descendants()).enter()
  .append("circle")
  .attrs({
    "cx": function(d) { return scales.x(d.id); },
    "cy": function(d) { return scales.y(d.data.depth); },
    "r": 5
  });
