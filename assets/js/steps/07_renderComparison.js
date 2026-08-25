function renderComparison() {
    const metric = getMetric();
    const innerHeight = viewport.comparison.height - comparisonMargin.top - comparisonMargin.bottom;
    const sortedCities = dataAll.cities.slice().sort(function(a, b) {
        return d3.descending(a[metric.accessor], b[metric.accessor]);
    });

    const root = d3.select("#comparisonChart")
        .selectAll(".comparison-root")
        .data([null])
        .join("g")
        .attr("class", "comparison-root")
        .attr("transform", `translate(${comparisonMargin.left},${comparisonMargin.top})`);

    root.selectAll(".comparison-x-axis")
        .data([null])
        .join("g")
        .attr("class", "comparison-x-axis chart-axis chart-grid")
        .call(
            d3.axisTop(comparisonXScale)
                .tickSize(-innerHeight)
                .tickFormat(function(value) {
                    return state.metric === "share" ? `${value}%` : d3.format("~s")(Number(value));
                })
        );

    root.selectAll(".comparison-y-axis")
        .data([null])
        .join("g")
        .attr("class", "comparison-y-axis chart-axis city-axis")
        .call(d3.axisLeft(comparisonYScale).tickSize(0).tickPadding(10));

    root.selectAll(".city-stem")
        .data(sortedCities, function(d) { return d.code; })
        .join("line")
        .attr("class", "city-stem")
        .attr("x1", comparisonXScale(0))
        .attr("x2", function(d) { return comparisonXScale(d[metric.accessor]); })
        .attr("y1", function(d) { return comparisonYScale(d.city) + comparisonYScale.bandwidth() / 2; })
        .attr("y2", function(d) { return comparisonYScale(d.city) + comparisonYScale.bandwidth() / 2; });

    root.selectAll(".city-dot")
        .data(sortedCities, function(d) { return d.code; })
        .join("circle")
        .attr("class", "city-dot")
        .attr("cx", function(d) { return comparisonXScale(d[metric.accessor]); })
        .attr("cy", function(d) { return comparisonYScale(d.city) + comparisonYScale.bandwidth() / 2; })
        .attr("r", 4.3);
}
