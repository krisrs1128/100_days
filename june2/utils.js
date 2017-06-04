
function subtree(hierarchy, query_id) {
  var cur_desc = hierarchy.descendants().map(function(d) { return d.id; });
  if (hierarchy.id == query_id) {
    return hierarchy;
  } else {
    for (var i = 0; i < hierarchy.children.length; i++) {
      var next_desc = hierarchy.children[i].descendants().map(function(d) { return d.id; });
      if (next_desc.indexOf(query_id) != -1) {
        return subtree(hierarchy.children[i], query_id);
      }
    }
  }
}

function update_heatmap_focus(elem, cur_tree, x_scale) {
  var cur_x = cur_tree.descendants()
      .map(function(d) { return d.data.x; });

  var bandwidth = x_scale.range()[1] / (x_scale.domain()[1] - x_scale.domain()[0]);
  var height = elem.attr("height");
  var x_extent = d3.extent(cur_x);
  elem.selectAll(".hm_focus")
    .transition()
    .duration(500)
    .attrs({
      "x": x_scale(x_extent[0]),
      "y": height / 5,
      "width": x_scale(x_extent[1]) - x_scale(x_extent[0]) + bandwidth,
      "height": 4 / 5 * height,
      "stroke": "red",
      "fill": "none"
    });
}

function update_tree_focus(elem, cur_tree, x_scale) {
  var cur_labels = cur_tree.descendants().map(function(d) {return d.id;});

  var fill_fun = function(d, type) {
    var indic;
    if (type == "node") {
      indic = cur_labels.indexOf(d.id);
    } else {
      indic = cur_labels.indexOf(d.source.id);
    }
    if (indic != -1) {
      return "red";
    }
    return "#555";
  };

  elem.selectAll(".hcnode")
    .transition()
    .duration(500)
    .attrs({
      "fill": function(d) { return fill_fun(d, "node"); }
    });

  elem.selectAll(".link")
    .transition()
    .duration(500)
    .attrs({
      "stroke": function(d) { return fill_fun(d, "link"); }
    });
}
