
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

var fill_fun = function(cur_labels, d, type) {
  var indic;
  if (type == "node") {
    indic = cur_labels.indexOf(d.id);
  } else if (type == "data_focus") {
    indic = cur_labels.indexOf(d.column);
  } else {
    indic = cur_labels.indexOf(d.source.id);
  }

  if (indic != -1) {
    return "red";
  }
  return "#555";
};

function update_tree_focus(elem, cur_tree, x_scale) {
  var cur_labels = cur_tree.descendants().map(function(d) {return d.id;});
  elem.selectAll(".hcnode")
    .transition()
    .duration(500)
    .attrs({
      "fill": function(d) { return fill_fun(cur_labels, d, "node"); }
    });

  elem.selectAll(".link")
    .transition()
    .duration(500)
    .attrs({
      "stroke": function(d) { return fill_fun(cur_labels, d, "link"); }
    });
}

function update_data_focus(elem, cur_tree, x_scale) {
  var cur_labels = cur_tree.descendants().map(function(d) {return d.id;});

  elem.selectAll(".data_focus")
    .transition()
    .duration(500)
    .attrs({
      "stroke": function(d) {
        if (cur_labels.indexOf(d[0].column) == -1) {
          return "#555";
        }
        return "red";
      },
      "stroke-opacity": function(d) {
        if (cur_labels.indexOf(d[0].column) == -1) {
          return 0.05;
        }
        return 0.1;
      },
      "stroke-width": function(d) {
        if (cur_labels.indexOf(d[0].column) == -1) {
          return 0.2;
        }
        return 3;
      }
    });
}
