chart = {
  var height = 500,
      width = 400;
  var svg = d3.select(DOM.svg(width, height))
  var branches = [{"length": .1, "coords": [[100, 100], [90, 100]]}];

  const branch_elems = svg.append("g")
        .attr("id", "branches");

  var path_fun = d3.line()
      .curve(d3.curveCardinal.tension(0.5))

  branch_elems.selectAll("path")
    .data(branches.map((d) => d.coords)).enter()
    .append("path")
    .attr("d", path_fun);

  const nodes = svg.append("g")
        .attr("id", "nodes");
  var all_nodes = [];
  for (var i = 0; i < branches.length; i++) {
    for (var j = 0; j < branches[i].coords.length; j++) {
      all_nodes.push(branches[i].coords[j]);
    }
  }
  nodes.selectAll("circle")
    .data(all_nodes).enter()
    .append("circle")
    .classed("nodes", true)
    .attr("cx", (d) => d[0])
    .attr("cy", (d) => d[1])
    .attr("r", 2)
    .attr("fill", "black");

  return svg.node();
}
