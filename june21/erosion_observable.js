// URL: https://beta.observablehq.com/@krisrs1128/untitled
// Title: Untitled
// Author: Kris Sankaran (@krisrs1128)
// Version: 335
// Runtime version: 1

const m0 = {
  id: "d17a66fbe258283e@335",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`inspired by an erosion process, but starts at a random position

http://pi.math.cornell.edu/~levine/erosion.pdf
`
)})
    },
    {
      name: "canvas",
      inputs: ["DOM","new_focus","any_intersect","hit_wall","random_color","d3","draw_circle"],
      value: (function*(DOM,new_focus,any_intersect,hit_wall,random_color,d3,draw_circle)
{
  const height = 200,
        width = 200,
        canvas = DOM.canvas(width, height),
        context = canvas.getContext("2d");

  var focus = new_focus([], width, height),
      fixed = [],
      collide;
  while (true) {
    if (fixed.length > 1e3) {
      return canvas;
    }

    context.save();
    context.clearRect(0, 0, width, height);

    collide = any_intersect(focus, fixed);
    if (hit_wall(focus, width, height)) {
      focus.fill = random_color();
      fixed = fixed.concat([focus]);
      focus = new_focus(fixed, width, height);
    } else if(collide != -1) {
      for (var j = 0; j < focus.fill.length; j++) {
        focus.fill[j] = Math.abs(fixed[collide].fill[j] + d3.randomNormal(0, 25)());
      }
      fixed = fixed.concat([focus]);
      focus = new_focus(fixed, width, height);
    } else {
      focus.y += focus.vy;
      focus.x += focus.vx;
      focus.vx += d3.randomNormal(0, 0.3)() - 0.01 * focus.vx;
      focus.vy += d3.randomNormal(0, 0.3)() - 0.01 * focus.vy;
    }

    draw_circle(context, focus);
    for (var j = 0; j < fixed.length; j++) {
      draw_circle(context, fixed[j]);
    }

    context.restore();
    yield canvas;
  }
}
)
    },
    {
      name: "new_focus",
      inputs: ["d3","any_intersect"],
      value: (function(d3,any_intersect){return(
function new_focus(fixed, width, height) {
  var focus,
      k = 1;
  while (true)   {
   focus = {
     "x": d3.randomUniform(0, width)(),
     "y": d3.randomUniform(0, height)(),
     "vx": 0,
     "vy": 0,
     "radius": d3.max([
       1,
       d3.randomLogNormal(2.5 / Math.sqrt(k), 0.5 / Math.sqrt(k))()
     ]),
     "fill": [42, 42, 42]
   };
    k += 1;
   if (any_intersect(focus, fixed) == -1) {
     return focus;
   }
  }
}
)})
    },
    {
      name: "intersect",
      value: (function(){return(
function intersect(a, b) {
  /**
   * Check if two circles intersect
   **/
  const dist = Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2));
  if (dist < a.radius + b.radius) {
    return true;
  }
  return false;
}
)})
    },
    {
      name: "any_intersect",
      inputs: ["intersect"],
      value: (function(intersect){return(
function any_intersect(focus, fixed) {
  for (var i = 0; i < fixed.length; i++) {
   if (intersect(focus, fixed[i])) {
    return i;
   }
  }
  return -1;
}
)})
    },
    {
      name: "hit_wall",
      value: (function(){return(
function hit_wall(pos, width, height) {
  if (pos.x < 0 || pos.x > width) {
    return true;
  }
  if (pos.y < 0 || pos.y > height) {
   return true;
  }
  return false;
}
)})
    },
    {
      name: "draw_circle",
      value: (function(){return(
function draw_circle(context, obj) {
  context.beginPath();
  context.arc(obj.x, obj.y, obj.radius, 0, 2 * Math.PI);
  context.fillStyle = "rgb(" + obj.fill.join(",") + ")";
  context.fill()
}
)})
    },
    {
      name: "random_color",
      inputs: ["d3"],
      value: (function(d3){return(
function random_color() {
  const cols = [
    [141,211,199],
    [255,255,179],
    [190,186,218],
    [251,128,114],
    [128,177,211],
    [253,180,98],
    [179,222,105],
    [252,205,229],
    [217,217,217],
    [188,128,189],
    [204,235,197]
  ]
  return cols[Math.floor(d3.randomUniform(0, cols.length)())];
}
)})
    },
    {
      name: "d3",
      inputs: ["require"],
      value: (function(require){return(
require("d3")
)})
    },
    {
      inputs: ["require"],
      value: (function(require){return(
require("d3-random")
)})
    }
  ]
};

const notebook = {
  id: "d17a66fbe258283e@335",
  modules: [m0]
};

export default notebook;
