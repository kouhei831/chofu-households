function initViewport() {
    d3.select("#comparisonChart")
        .attr("viewBox", `0 0 ${viewport.comparison.width} ${viewport.comparison.height}`)
        .attr("height", viewport.comparison.height);

    d3.select("#timeChart")
        .attr("viewBox", `0 0 ${viewport.time.width} ${viewport.time.height}`);
}
