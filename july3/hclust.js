
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
var group_labels = ["tiles", "tile_cover", "links", "voronoi"];
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
var facet_x = extract_unique(data, "facet_x");
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
    "cx": function(d) { return scales.tree_x(d.data.y); },
    "cy": function(d) { return scales.tree_y(d.data.x); }
  });

// Define voronoi polygons for the tree nodes
var voronoi = d3.voronoi()
    .x(function(d) {return scales.tree_x(d.data.y); })
    .y(function(d) {return scales.tree_y(d.data.x); })
    .extent([[0, 0], [scales.tree_x.range()[0], scales.tree_y.range()[1]]]);

elem.select("#voronoi")
  .selectAll(".voronoi")
  .data(voronoi(root.descendants()).polygons()).enter()
  .append("path")
  .attrs({
    "id": function(d) { return d.data.id; },
    "d": function(d) { return "M" + d.join("L") + "Z"; },
    "class": "voronoi",
    "fill": "none",
    "pointer-events": "all"
  })
  .on("mouseover", update_wrapper);

var link_fun = d3.linkHorizontal()
    .x(function(d) { return scales.tree_x(d.data.y); })
    .y(function(d) { return scales.tree_y(d.data.x); });

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
var bandwidth = scales.tree_y.range()[1] / (scales.tree_y.domain()[1] - scales.tree_y.domain()[0]);
elem.select("#tiles")
  .selectAll(".tile")
  .data(data, tile_id_fun).enter()
  .append("rect")
  .attrs({
    "class": "tile",
    "x": function(d) { return scales.tile_x(d.row); },
    "y": function(d) { return scales.tree_y(d.x); },
    "width": scales.tile_x.bandwidth(),
    "height": bandwidth,
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
    "y": function(d) { return scales.tree_y(d.x); },
    "height": bandwidth,
    "x": scales.tile_x.range()[0],
    "width": scales.tile_x.range()[1] - scales.tile_x.range()[0],
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

function update_wrapper(d) {
  var cur_tree = subtree(root, d.data.id);
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
    scales.cluster_cols[cur_cluster],
    scales.facet_offset.domain(),
    facet_x
  );
  update_heatmap(
    elem,
    opts.n_clusters
  );
}
