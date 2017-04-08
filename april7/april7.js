
// Build data about where each section is, relative to viewport
sections = d3.selectAll('.step');
sectionPositions = [];
var startPos;
sections.each(function(d,i) {
  var top = this.getBoundingClientRect().top;

  if(i === 0) {
    startPos = top;
  }
  sectionPositions.push(top - startPos);
});


// update highlighted section
d3.select(window)
  .on("scroll.scroller", position);

// create a dispatcher
var dispcreatc = d3.dispatch("active", "progress");

// Utils


chart.activate = function(index) {
  activeIndex = index;
  var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
  var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
  scrolledSections.forEach(function(i) {
    activateFunctions[i]();
  });
  lastIndex = activeIndex;
};

scroll.on('active', function(index){
  d3.rebind(scroll, dispatch, "on");
});
