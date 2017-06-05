
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
var group_labels = ["tiles"];
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
  .data(root.descendants(), function(d) { return d.id; }).enter()
  .append("circle")
  .attrs({
    "class": "hcnode",
    "fill": "#555",
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
      elem.select("#subtree_" + cur_cluster),
      elem.select("#subtree_0"),
      cur_tree,
      scales.tree_x,
      scales.tree_y,
      scales.cluster_cols[cur_cluster]
    );
    // update_data_focus(
    //   elem.select("#time_series_" + k),
    //   elem.select("#time_series_0"),
    //   cur_tree,
    //   scales.tree_x
    // );
  });

var link_fun = d3.linkVertical()
    .x(function(d) { return scales.tree_x(d.data.x); })
    .y(function(d) { return scales.tree_y(d.data.y); });

elem.selectAll(".link")
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
  .data(data).enter()
  .append("rect")
  .attrs({
    "class": "tile",
    "x": function(d) { return scales.tree_x(d.x); },
    "y": function(d) { return scales.tile_y(d.row); },
    "width": bandwidth,
    "height": scales.tile_y.bandwidth(),
    "fill": function(d) { return scales.tile_fill(d.value); }
  });

elem.append("rect")
  .attrs({"class": "hm_focus"});

var line = d3.line()
    .x(function(d) {
      return scales.centroid_x(d.row); })
    .y(function(d) {
      return scales.centroid_y(d.value); });

// draw the centroids
elem.selectAll(".data_focus")
  .data(ts_data).enter()
  .append("path")
  .attrs({
    "class": "data_focus",
    "stroke-opacity": 0.2,
    "stroke-width": 0.2,
    "stroke": "#555"
  })
  .attr("d", line);
