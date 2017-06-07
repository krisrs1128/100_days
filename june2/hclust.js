
var root = d3.stratify()
    .id(function(d) { return d.id; })
    .parentId(function(d) { return d.parent; })(tree);

var opts = parameter_defaults({});
var elem = d3.select("#vis")
    .append("svg")
    .attrs({
      "width": opts.elem_width,
      "height": opts.elem_height
    });

elem.append("rect")
  .attrs({
    "fill": "#F8F8F8",
    "width": opts.elem_width,
    "height": opts.elem_height
  });

// layer 0 represents all samples / features, and is always on top (even if invisible)
var cur_cluster = 1;
var group_labels = ["tiles", "tile_cover", "links"];
for (var k = opts.n_clusters; k >= 0; k--) {
  group_labels = group_labels.concat([
    "subtree_" + k,
    "hm_focus_" + k,
    "time_series_" + k,
    "centroids_" + k
  ]);
}

elem.selectAll("g")
  .data(group_labels).enter()
  .append("g")
  .attr("id", function(d) { return d; });

var scales = scales_dictionary(tree, data, opts);
d3.cluster()(root);

// Draw the tree
elem.select("#subtree_0")
  .selectAll(".hcnode")
  .data(root.descendants(), id_fun).enter()
  .append("circle")
  .attrs({
    "class": "hcnode",
    "r": 2,
    "fill": "#555",
    "fill-opacity": 0.4,
    "cx": function(d) { return scales.tree_x(d.data.x); },
    "cy": function(d) { return scales.tree_y(d.data.y); }
  })
  .on("mouseover", function(d) {
    var cur_tree = subtree(root, d.id);
    update_heatmap_focus(
      elem.select("#hm_focus_" + cur_cluster),
      cur_tree,
      scales.tree_x,
      scales.cluster_cols[cur_cluster]
    );
    update_tree_focus(
      elem,
      cur_tree.descendants(),
      cur_cluster,
      opts.n_clusters,
      scales.tree_x,
      scales.tree_y,
      scales.cluster_cols[cur_cluster]
    );
    update_ts_focus(
      elem,
      ts_data,
      cur_tree.leaves().map(id_fun),
      cur_cluster,
      scales.cluster_cols[cur_cluster]
    );
    update_heatmap(
      elem,
      opts.n_clusters
    );
  });

var link_fun = d3.linkVertical()
    .x(function(d) { return scales.tree_x(d.data.x); })
    .y(function(d) { return scales.tree_y(d.data.y); });

elem.select("#links")
  .selectAll(".link")
  .data(root.links()).enter()
  .append("path")
  .attrs({
    "class": "link",
    "stroke": "#555",
    "d": link_fun
  });

// Draw the heatmap
var bandwidth = scales.tree_x.range()[1] / (scales.tree_x.domain()[1] - scales.tree_x.domain()[0]);
elem.select("#tiles")
  .selectAll(".tile")
  .data(data, tile_id_fun).enter()
  .append("rect")
  .attrs({
    "class": "tile",
    "x": function(d) { return scales.tree_x(d.x); },
    "y": function(d) { return scales.tile_y(d.row); },
    "width": bandwidth,
    "height": scales.tile_y.bandwidth(),
    "fill": function(d) { return scales.tile_fill(d.value); }
  });

// Draw shades / covers on the heatmap
var init_level = data[0].row;
elem.select("#tile_cover")
  .selectAll(".tile_cover")
  .data(data.filter(function(d) { return d.row == init_level;}), function(d) { return d.x; }).enter()
  .append("rect")
  .attrs({
    "class": "tile_cover",
    "x": function(d) { return scales.tree_x(d.x); },
    "width": bandwidth,
    "y": scales.tile_y.range()[0],
    "height": scales.tile_y.range()[1] - scales.tile_y.range()[0],
    "fill-opacity": 0
  });

elem.append("rect")
  .attrs({"class": "hm_focus"});

var line = d3.line()
    .x(function(d) {
      return scales.centroid_x(d.facet_x);
    })
    .y(function(d) {
      return scales.facet_offset(d.facet) + scales.centroid_y(d.value);
    });
