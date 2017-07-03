
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

function update_heatmap_focus(focus_elem, cur_tree, y_scale, stroke_color, tile_x_scale) {
  var cur_y = cur_tree.leaves()
      .map(function(d) { return d.data.x; });

  var bandwidth = y_scale.range()[1] / (y_scale.domain()[1] - y_scale.domain()[0]);
  var y_extent = d3.extent(cur_y);

  var focus_rect = focus_elem.select("rect");
  var n_rects = focus_rect.nodes().length;
  if (n_rects === 0) {
    focus_elem.append("rect");
  }

  focus_rect = focus_elem.selectAll("rect")
    .transition()
    .duration(500)
    .attrs({
      "class": "hm_focus",
      "y": y_scale(y_extent[0]),
      "x": tile_x_scale.range()[0],
      "height": y_scale(y_extent[1]) - y_scale(y_extent[0]) + bandwidth,
      "width": tile_x_scale.range()[1] - tile_x_scale.range()[0],
      "stroke": stroke_color,
      "stroke-opacity": 0.7,
      "fill": "none"
    });
}

function update_heatmap(elem, n_clusters) {
  var highlighted_ids = selected_ids(elem, n_clusters);
  elem.select("#tile_cover")
    .selectAll(".tile_cover")
    .attrs({
      "fill-opacity": function(d)  {
        if (highlighted_ids.indexOf(d.column) != -1) {
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
  return d.column + "-" + d.row;
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
      "cx": function(d) { return x_scale(d.data.y); },
      "cy": function(d) { return y_scale(d.data.x); }
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

function update_ts_focus(elem, ts_data, cur_ids, cur_cluster, stroke_color, facets, facets_x) {
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
      "class": "highlighted_series",
      "stroke": stroke_color,
      "d": line
    });

  elem.select("#centroids_" + cur_cluster)
    .selectAll(".centroid")
    .remove();

  var means = elemwise_mean(cluster_data, facets, facets_x);
  elem.select("#centroids_" + cur_cluster)
    .selectAll(".centroid")
    .data(means).enter()
    .append("path")
    .attrs({
      "stroke": stroke_color,
      "class": "centroid",
      "d": line
    });
}

function elemwise_mean(x_array, facets, facets_x) {
  var means = [];
  for (var j = 0; j < facets.length; j++) {
    var array_sub = x_array.filter(function(d) { return d[0].facet == facets[j]; });
    var facet_mean = [];
    for (var t = 0; t < array_sub[0].length; t++) {
      facet_mean.push(
        {
          "facet": facets[j],
          "facet_x": array_sub[0][t].facet_x,
          "value": d3.mean(array_sub.map(function(x) { return x[t].value; }))
        }
      );
    }
    means.push(facet_mean);
  }

  return means;
}

function parameter_defaults(opts) {
  var default_opts = {
    "n_clusters": 3,
    "elem_height": 850,
    "elem_width": 800,
    "tree_y_prop": 1,
    "tree_x_prop": 0.1,
    "facet_x_prop": 0.35,
    "facet_y_prop": 0.55
  };

  var keys = Object.keys(default_opts);
  for (var i = 0; i < keys.length; i++) {
    if (Object.keys(opts).indexOf(keys[i]) == -1) {
      opts[keys[i]] = default_opts[keys[i]];
    }
  }
  return opts;
}

function extract_unique(x, key) {
  var u = x.map(function(d) { return d[key]; })
  return d3.set(u).values();
}

function scales_dictionary(tree, data, opts) {
  var coords = {
    "x": tree.map(function(d) { return d.x; }),
    "y": tree.map(function(d) { return d.y; })
  };
  var facets = extract_unique(data, "facet");
  var fill_vals = data.map(function(d) { return d.value; });
  var facet_x = extract_unique(data, "facet_x").map(parseFloat);

  return {
    "tile_x": d3.scaleBand()
      .domain(extract_unique(data, "row"))
      .range([10 + opts.tree_x_prop * opts.elem_width, (1 - opts.facet_x_prop) * opts.elem_width]),
    "tile_fill": d3.scaleLinear()
      .domain(d3.extent(fill_vals))
      .range(["#f8f8f8", "black"]),
    "tree_x": d3.scaleLinear()
      .domain(d3.extent(coords.y))
      .range([opts.tree_x_prop * opts.elem_width, 0]),
    "tree_y": d3.scaleLinear()
      .domain(d3.extent(coords.x))
      .range([0, opts.tree_y_prop * opts.elem_height]),
    "centroid_x": d3.scaleLinear()
      .domain(d3.extent(facet_x))
      .range([(1.01 - opts.facet_x_prop) * opts.elem_width, 0.98 * opts.elem_width]),
    "centroid_y": d3.scaleLinear()
      .domain(d3.extent(fill_vals))
      .range([opts.facet_y_prop * opts.elem_height / facets.length, 0]),
    "cluster_cols": ["#555", '#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'],
    "facet_offset": d3.scaleBand()
      .domain(facets)
      .range([0, opts.facet_y_prop * opts.elem_height])
  };

}
