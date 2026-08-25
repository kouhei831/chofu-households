function renderHeroWaffle() {
    const latest = dataAll.history[dataAll.history.length - 1];
    const cellSize = 19;
    const gap = 7;

    d3.select("#heroWaffle")
        .selectAll("rect")
        .data(d3.range(100), function(d) { return d; })
        .join("rect")
        .attr("x", function(d) { return (d % 10) * (cellSize + gap); })
        .attr("y", function(d) { return Math.floor(d / 10) * (cellSize + gap); })
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("rx", 5)
        .attr("class", function(d) {
            return d < Math.round(latest.single) ? "waffle-cell is-single" : "waffle-cell";
        });
}
