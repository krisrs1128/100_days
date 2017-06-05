
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

function update_heatmap_focus(focus_elem, cur_tree, x_scale, stroke_color) {
  var cur_x = cur_tree.leaves()
      .map(function(d) { return d.data.x; });

  var bandwidth = x_scale.range()[1] / (x_scale.domain()[1] - x_scale.domain()[0]);
  var height = elem.attr("height");
  var x_extent = d3.extent(cur_x);

  var focus_rect = focus_elem.select("rect");
  var n_rects = focus_rect.nodes().length
  if (n_rects == 0) {
    focus_elem.append("rect")
  }

  focus_rect = focus_elem.selectAll("rect");
  console.log(focus_rect);
  focus_rect.transition()
    .duration(500)
    .attrs({
      "class": "hm_focus",
      "x": x_scale(x_extent[0]),
      "y": height / 5,
      "width": x_scale(x_extent[1]) - x_scale(x_extent[0]) + bandwidth,
      "height": 4 / 5 * height,
      "stroke": stroke_color,
      "stroke-opacity": 0.7,
      "fill": "none"
    });
}

function fill_fun(cur_labels, d, type) {
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

function id_fun(d) {
  return d.id;
}

function update_tree_focus(cluster_elem, base_elem, cur_tree, x_scale, y_scale, fill_color) {
  var cur_labels = cur_tree.descendants().map(id_fun);

  cluster_elem.selectAll(".hcnode")
    .data(cur_tree.descendants(), id_fun).exit()
    .transition("fadeaway")
    .remove();

  cluster_elem.selectAll(".hcnode")
    .data(cur_tree.descendants(), id_fun).enter()
    .append("circle")
    .attrs({
      "class": "hcnode",
      "fill": fill_color,
      "cx": function(d) { return x_scale(d.data.x); },
      "cy": function(d) { return y_scale(d.data.y); },
      "fill-opacity": 0.4
    });

}

function update_data_focus(elem, cur_tree, x_scale) {
  var cur_labels = cur_tree.leaves().map(function(d) {return d.id;});

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

function parameter_defaults(opts) {
  var default_opts = {
    "n_clusters": 3,
    "elem_height": 350,
    "elem_width": 1200,
    "tree_y_prop": 0.2,
    "tree_x_prop": 0.8
  };

  var keys = Object.keys(default_opts);
  for (var i = 0; i < keys.length; i++) {
    if (Object.keys(opts).indexOf(keys[i]) == -1) {
      opts[keys[i]] = default_opts[keys[i]];
    }
  }
  return opts;
}

function scales_dictionary(tree, data, opts) {
  var coords = {
    "x": tree.map(function(d) { return d.x; }),
    "y": tree.map(function(d) { return d.y; })
  };
  var rows = data.map(function(d) { return d.row; });
  rows = d3.set(rows).values();
  var fill_vals = data.map(function(d) { return d.value; });

  return {
    "tile_y": d3.scaleBand()
      .domain(rows)
      .range([opts.tree_y_prop * opts.elem_height, opts.elem_height]),
    "tile_fill": d3.scaleLinear()
      .domain(d3.extent(fill_vals))
      .range(["#f8f8f8", "black"]),
    "tree_x": d3.scaleLinear()
      .domain(d3.extent(coords.x))
      .range([0, opts.tree_x_prop * opts.elem_width]),
    "tree_y": d3.scaleLinear()
      .domain(d3.extent(coords.y))
      .range([opts.tree_y_prop * opts.elem_height - 10, 0]),
    "centroid_x": d3.scaleBand()
      .domain(rows)
      .range([opts.tree_x_prop * opts.elem_width + 10, opts.elem_width]),
    "centroid_y": d3.scaleLinear()
      .domain(d3.extent(fill_vals))
      .range([opts.elem_height, 0]),
    "cluster_cols": ["#555", "orange", "steelblue", "plum"]
  };

}
