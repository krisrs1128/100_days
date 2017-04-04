
// Random walk on the hypercube

// Initialize data structure
function initialize_data(n_rows, n_cols) {
  var data = []
  for (var i = 0; i < n_rows; i++) {
    data[i] = [];
    for (var j = 0; j < n_cols; j++) {
      data[i][j] = 0;
    }
  }
  return data;
}

function take_step(x, pi) {
  var new_x = x;
  for (var i = 0; i < x.length; i++) {
    if (Math.random() < pi) {
      new_x[i] = (x[i] + 1) % 2;
    }
  }
  return new_x;
}

function structure_to_array(x) {
  var array_data = [];
  var n_rows = x.length;
  var n_cols = x[0].length;

  for (var i = 0; i < n_rows; i++) {
    for (var j = 0; j < n_cols; j++) {
      array_data.push({
        "value": x[i][j],
        "row": i,
        "col": j
      });
    }
  }
  return array_data;
}

function initialize_display(elem, x, fill_scale) {
  var width = elem.attr("width");
  var height = elem.attr("height");
  var I = x.length;
  var J = x[0].length;
  var array_data = structure_to_array(x);

  elem.selectAll("rect")
    .data(array_data, function(d) { return d.row + "_" + d.col; } )
    .enter()
    .append("rect")
    .attrs({
      "x": function(d) {
        return (d.row * width / I);
      },
      "y": function(d) {
        return (d.col * height / J);
      },
      "width": width / I,
      "height": height / J,
      "fill": "#75B998"
    });
}

function update_display(elem, x, fill_scale) {
  var width = elem.attr("width");
  var height = elem.attr("height");
  var I = x.length;
  var J = x[0].length;
  var array_data = structure_to_array(x);

  elem.selectAll("rect")
    .data(array_data, function(d) { return d.row + "_" + d.col; })
    .attrs({
      "fill": function(d) {
        return fill_scale(d.value); }
    });
}
