
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
