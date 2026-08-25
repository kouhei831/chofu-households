function initControls() {
    d3.selectAll(".metric-toggle button")
        .on("click", function(event) {
            state.metric = event.currentTarget.dataset.metric;
            setScales();
            renderComparison();
        });

    d3.select("#citySelect")
        .selectAll("option")
        .data(dataAll.cities, function(d) { return d.code; })
        .join("option")
        .attr("value", function(d) { return d.city; })
        .text(function(d) { return d.city; });

    d3.select("#yearSelector")
        .selectAll("button")
        .data(dataAll.history, function(d) { return d.year; })
        .join("button")
        .attr("type", "button")
        .text(function(d) { return d.year; });
}
