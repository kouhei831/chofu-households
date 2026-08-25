function renderTimeSeries() {
    const innerWidth = viewport.time.width - timeMargin.left - timeMargin.right;
    const innerHeight = viewport.time.height - timeMargin.top - timeMargin.bottom;
    const root = d3.select("#timeChart")
        .selectAll(".time-root")
        .data([null])
        .join("g")
        .attr("class", "time-root")
        .attr("transform", `translate(${timeMargin.left},${timeMargin.top})`);

    root.selectAll(".time-y-axis")
        .data([null])
        .join("g")
        .attr("class", "time-y-axis chart-axis chart-grid")
        .call(d3.axisLeft(timeYScale).tickSize(-innerWidth).tickFormat(function(value) { return `${value}%`; }));

    root.selectAll(".time-x-axis")
        .data([null])
        .join("g")
        .attr("class", "time-x-axis chart-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(timeXScale).tickSizeOuter(0));

    const lineFor = function(key) {
        return d3.line()
            .x(function(d) { return timeXScale(d.year); })
            .y(function(d) { return timeYScale(d[key]); })
            .curve(d3.curveMonotoneX);
    };

    root.selectAll(".time-series-line")
        .data(trendSeries, function(d) { return d.key; })
        .join("path")
        .attr("class", function(d) { return `time-series-line time-line-${d.key}`; })
        .attr("d", function(d) { return lineFor(d.key)(dataAll.history); });
}
