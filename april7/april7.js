
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


function position() {
  var pos = window.pageYOffset - 10;
  var sectionIndex = d3.bisect(sectionPositions, pos);
  sectionIndex = Math.min(sections.size() - 1, sectionIndex);

  if (currentIndex !== sectionIndex) {
    dispatch.active(sectionIndex);
    currentIndex = sectionIndex;
  }

  var prevIndex = Math.max(sectionIndex - 1, 0);
  var prevTop = sectionPositions[prevIndex];
  var progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
  dispatch.progress(currentIndex, progress);
}

scroll.on('active', function(index){
  d3.rebind(scroll, dispatch, "on");
}
