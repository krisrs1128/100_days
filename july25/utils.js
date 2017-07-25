
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

function update_heatmap_focus(focus_elem, cur_tree, y_scale, tile_x_scale) {
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
      "stroke": "black",
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

function update_tree_focus(elem, cluster_data, cur_cluster, n_clusters, x_scale, y_scale) {
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
      "fill": "black",
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

function group_counts(elem, n_clusters) {
  var cluster_counts = {};
  for (var k = 1; k <= n_clusters; k++) {
    var cur_ids = elem.select("#subtree_" + k)
        .selectAll(".hcnode").data()
        .map(id_fun);
    var groups = data.filter(function(d) { return d.row == "D1"; })
        .filter(function(d) { return cur_ids.indexOf(d.column) != -1; })
        .map(function(d) { return d.group; });

    var counts = {};
    for(var i = 0; i < groups.length; i++) {
      var group = groups[i];
      counts[group] = counts[group] ? counts[group]+1 : 1;
    }
    cluster_counts[k] = counts;
  }

  return cluster_counts;
}

function counts_array(counts) {
  var arr = [];
  var clusters = Object.keys(counts);
  for (var k = 0; k < clusters.length; k++) {
    var groups = Object.keys(counts[clusters[k]]);
    for (var i = 0; i < groups.length; i++) {
      arr.push({
        "cluster": clusters[k],
        "group": groups[i],
        "count": counts[clusters[k]][groups[i]]
      });
    }
  }

  return arr;
}

function group_array(elem, n_clusters) {
  return counts_array(
    group_counts(elem, n_clusters)
  );
}

function update_histo(elem, scales, n_clusters, histo_axis) {
  // reset scales
  var counts = group_array(elem, n_clusters);
  scales.histo_x.domain(
    [0, d3.max(counts.map(function(d) { return d.count; }))]
  );

  elem.transition()
    .duration(700)
    .select("#histo_axis")
    .call(histo_axis.scale(scales.histo_x));

  elem.select("#group_histo")
    .selectAll(".histo_bar")
    .data(counts, function(d) { return d.cluster + d.group; }).enter()
    .append("rect")
    .attrs({
     "class": "histo_bar",
      "x": scales.centroid_x.range()[0],
      "width": 0,
      "y": function(d) {return scales.histo_group(d.group) + scales.histo_offset(d.cluster);},
      "height": scales.histo_offset.step(),
      "fill": function(d) { return "black"; }
    });

  elem.select("#group_histo")
    .selectAll(".histo_bar")
    .data(counts, function(d) { return d.cluster + d.group; }).exit()
    .attrs({"width": 0})
    .remove();

  elem.select("#group_histo")
    .selectAll(".histo_bar")
    .transition()
    .duration(700)
    .attrs({
      "width": function(d) { return scales.histo_x(d.count); },
      "y": function(d) {return scales.histo_group(d.group) + scales.histo_offset(d.cluster);},
      "height": scales.histo_offset.step()
    });
}

function update_ts_focus(elem, ts_data, cur_cluster, facet_offset, fill_cols, facets_x) {
  var cluster_data0 = ts_data.filter(function(d) {
    if (typeof(d[0].cluster) == "undefined") {
      return false;
    }
    return d[0].cluster.indexOf(cur_cluster) != -1;
  });
  var cluster_data = [];
  for (var i = 0; i < cluster_data0.length; i++) {
    cluster_data.push($.extend(true, [], cluster_data0[i]));
  }

  for (var i = 0; i < cluster_data.length; i++) {
    cluster_data[i][0].cluster = cur_cluster;
  }

  var cluster_elem = elem.select("#time_series_" + cur_cluster)
      .selectAll(".highlighted_series")
      .data(cluster_data, ts_id_fun);

  cluster_elem.exit().remove();
  cluster_elem.enter()
    .append("path")
    .attrs({
      "class": "highlighted_series",
      "stroke": "black",
      "d": line,
      "transform": function(d) {
        return "translate(0," + facet_offset(d[0].cluster) + ")";
      }
    });

  elem.selectAll(".highlighted_series")
    .transition()
    .duration(700)
    .attrs({
      "d": line,
      "transform": function(d) {
        return "translate(0," + facet_offset(d[0].cluster) + ")";
      }
    });

  var means = elemwise_mean(cluster_data, fill_cols.domain());
  elem.select("#centroids_" + cur_cluster)
    .selectAll(".centroid")
    .data(means).enter()
    .append("path")
    .attrs({
      "stroke": "black",
      "class": "centroid"
    });

  elem.selectAll(".centroid")
    .transition()
    .duration(700)
    .attrs({
      "transform": function(d) {
        return "translate(0," + facet_offset(d[0].cluster) + ")";
      },
      "d": line
    });
}

function update_wrapper(d) {
  var cur_tree = subtree(root, d.data.id);
  var cur_ids = cur_tree.leaves().map(id_fun);
  for (var i = 0; i < ts_data.length; i++) {
    var is_defined = typeof(ts_data[i][0].cluster) != "undefined";
    if (is_defined) {
      var cluster_ix = ts_data[i][0].cluster.indexOf(cur_cluster);
      if (cluster_ix != -1) {
        ts_data[i][0].cluster.splice(cluster_ix, 1);
      }
    }
    if (cur_ids.indexOf(ts_data[i][0].column) != -1) {
      if (!is_defined) {
        ts_data[i][0].cluster = [cur_cluster];
      } else {
        ts_data[i][0].cluster.push(cur_cluster);
      }
    }
  }

  update_heatmap_focus(
    elem.select("#hm_focus_" + cur_cluster),
    cur_tree,
    scales.tree_y,
    scales.tile_x
  );
  update_tree_focus(
    elem,
    cur_tree.descendants(),
    cur_cluster,
    opts.n_clusters,
    scales.tree_x,
    scales.tree_y
  );
  update_ts_focus(
    elem,
    ts_data,
    cur_cluster,
    scales.facet_offset,
    scales.fill_cols,
    facet_x
  );
  update_heatmap(
    elem,
    opts.n_clusters
  );
  update_histo(
    elem,
    scales,
    opts.n_clusters,
    histo_axis
  );
}

function elemwise_mean(x_array, fills) {
  var means = [];
  for (var j = 0; j < fills.length; j++) {
    var array_sub = x_array.filter(function(d) { return d[0].fill == fills[j]; });
    var fill_mean = [];
    for (var t = 0; t < array_sub[0].length; t++) {
      fill_mean.push(
        {
          "cluster": array_sub[0][0].cluster,
          "fill": fills[j],
          "facet_x": array_sub[0][t].facet_x,
          "value": d3.mean(array_sub.map(function(x) { return x[t].value; }))
        }
      );
    }
    means.push(fill_mean);
  }

  return means;
}

function parameter_defaults(opts) {
  var default_opts = {
    "n_clusters": 3,
    "elem_height": 950,
    "elem_width": 850,
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
  var u = x.map(function(d) { return d[key]; });
  return d3.set(u).values();
}

function scales_dictionary(tree, data, opts, max_cluster) {
  var coords = {
    "x": tree.map(function(d) { return d.x; }),
    "y": tree.map(function(d) { return d.y; })
  };
  var fill_cols = extract_unique(data, "fill");
  var groups = extract_unique(data, "group");
  var fill_intensity = data.map(function(d) { return d.value; });
  var facet_x = extract_unique(data, "facet_x").map(parseFloat);

  return {
    "tile_x": d3.scaleBand()
      .domain(extract_unique(data, "row"))
      .range([10 + opts.tree_x_prop * opts.elem_width, (1 - opts.facet_x_prop) * opts.elem_width]),
    "tile_fill": d3.scaleLinear()
      .domain(d3.extent(fill_intensity))
      .range(["#f8f8f8", "black"]),
    "tree_x": d3.scaleLinear()
      .domain(d3.extent(coords.y))
      .range([opts.tree_x_prop * opts.elem_width, 0]),
    "tree_y": d3.scaleLinear()
      .domain(d3.extent(coords.x))
      .range([0, opts.tree_y_prop * opts.elem_height]),
    "centroid_x": d3.scaleLinear()
      .domain(d3.extent(facet_x))
      .range([30 + (1 - opts.facet_x_prop) * opts.elem_width, opts.elem_width]),
    "centroid_y": d3.scaleLinear()
      .domain(d3.extent(fill_intensity))
      .range([opts.facet_y_prop * opts.elem_height / max_cluster - 10, 0]),
    "fill_cols": d3.scaleBand()
      .domain(fill_cols)
      .range(["#555", '#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854']),
    "facet_offset": d3.scaleBand()
      .domain(d3.range(max_cluster, 0, -1))
      .range([0, opts.facet_y_prop * opts.elem_height]),
    "histo_x": d3.scaleLinear()
      .domain([0, 100])
      .range([0, 0.50 * opts.facet_x_prop * opts.elem_width]),
    "histo_group": d3.scaleBand()
      .domain(groups)
      .range([30 + opts.facet_y_prop * opts.elem_height, opts.elem_height]),
    "histo_offset": d3.scaleBand()
      .domain([1, 2])
      .range([0, (opts.facet_y_prop * opts.elem_height - 30) / groups.length])
  };

}
