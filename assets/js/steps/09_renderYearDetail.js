function renderYearDetail() {
    const activeYear = state.hoveredYear || state.selectedYear;
    const active = dataAll.history.find(function(d) { return d.year === activeYear; });
    const first = dataAll.history[0];

    d3.select("#detailYear").text(`${active.year}年`);
    d3.select("#detailShare").text(active.single.toFixed(1));
    d3.select("#changeNote").text(
        `1995年から ${active.single - first.single >= 0 ? "+" : ""}${(active.single - first.single).toFixed(1)}ポイント`
    );

    d3.select("#compositionBar")
        .selectAll("span")
        .data(categories, function(d) { return d.key; })
        .join("span")
        .attr("class", function(d) { return `segment segment-${d.key}`; })
        .style("width", function(d) { return `${active[d.key]}%`; });
}
