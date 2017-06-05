
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

  focus_rect = focus_elem.selectAll("rect")
    .transition()
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

function update_heatmap(elem, n_clusters) {
  var highlighted_ids = selected_ids(elem, n_clusters);
  elem.selectAll("#tile_cover")
    .selectAll(".tile_cover")
    .attrs({
      "fill-opacity": function(d)  {
        if (highlighted_ids.indexOf(d.id) == -1) {
          return 0;
        }
        return 0.4;
      }
    });
}

function id_fun(d) {
  return d.id;
}

function ts_id_fun(d) {
  return d[0].column;
}

function tile_id_fun(d) {
  return d.row + "-" + d.column
}

function update_tree_focus(elem, cluster_data, cur_cluster, n_clusters, x_scale, y_scale, fill_color) {
  elem.select("#subtree_" + cur_cluster)
    .selectAll(".hcnode")
    .data(cluster_data, id_fun).exit()
    .remove();

  elem.select("#subtree_" + cur_cluster)
    .selectAll(".hcnode")
    .data(cluster_data, id_fun).enter()
    .append("circle")
    .attrs({
      "class": "hcnode",
      "r": 2,
      "fill": fill_color,
      "fill-opacity": 0.4,
      "cx": function(d) { return x_scale(d.data.x); },
      "cy": function(d) { return y_scale(d.data.y); }
    });

  var highlight_ids = selected_ids(elem, n_clusters);
  elem.select("#subtree_0")
    .selectAll(".hcnode")
    .attrs({
      "fill-opacity": function(d) {
        if (highlight_ids.indexOf(d.id) == -1) {
          return 0.4;
        }
        return 0;
      }
    });
}

// ids selected by any cluster
function selected_ids(elem, n_clusters) {
  var cur_labels = [];
  for (var k = 1; k <= n_clusters; k++) {
    cur_labels = cur_labels.concat(
      elem.select("#subtree_" + k).selectAll(".hcnode").data().map(id_fun)
    );
  }
  return cur_labels;
}

function update_ts_focus(elem, ts_data, cur_ids, cur_cluster, stroke_color) {
  var cluster_data = ts_data.filter(function(d) { return cur_ids.indexOf(d[0].column) != -1; });
  elem.select("#time_series_" + cur_cluster)
    .selectAll(".highlighted_series")
    .data(cluster_data, ts_id_fun).exit()
    .remove();

  elem.select("#time_series_" + cur_cluster)
    .selectAll(".highlighted_series")
    .data(cluster_data, ts_id_fun).enter()
    .append("path")
    .attrs({
      "stroke": stroke_color,
      "class": "highlighted_series",
      "d": line
    });

  var means = elemwise_mean(cluster_data);
  elem.select("#centroids_" + cur_cluster)
    .selectAll(".centroid")
    .data(means, function(d) { return cur_cluster; }).enter()
    .append("path")
    .attrs({
      "stroke": stroke_color,
      "class": "centroid",
      "d": line
    });
}

function elemwise_mean(x_array) {
  var keys = [];
  var x_concat = [];
  for (var i = 0; i < x_array.length; i++) {
    keys = keys.concat(x_array[i].map(function(d) { return d.row; }));
    x_concat = x_concat.concat(x_array[i]);
    keys = d3.set(keys).values();
  }

  var means = {};
  for (var j = 0; j < keys.length; j++) {
    var filter_data = x_concat
        .filter(function(d) { return d.row == keys[j]; })
        .map(function(d) { return d.value; });
    means[keys[j]] = d3.mean(filter_data);
  }
  return means;
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
