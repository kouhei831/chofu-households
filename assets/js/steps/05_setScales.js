const comparisonXScale = d3.scaleLinear();
const comparisonYScale = d3.scaleBand();
const timeXScale = d3.scalePoint();
const timeYScale = d3.scaleLinear();

function setScales() {
    const metric = getMetric();
    const comparisonInnerWidth = viewport.comparison.width - comparisonMargin.left - comparisonMargin.right;
    const comparisonInnerHeight = viewport.comparison.height - comparisonMargin.top - comparisonMargin.bottom;
    const sortedCities = dataAll.cities.slice().sort(function(a, b) {
        return d3.descending(a[metric.accessor], b[metric.accessor]);
    });

    comparisonXScale
        .domain(state.metric === "share" ? [0, 55] : [0, d3.max(sortedCities, function(d) { return d[metric.accessor]; }) * 1.05])
        .range([0, comparisonInnerWidth]);

    comparisonYScale
        .domain(sortedCities.map(function(d) { return d.city; }))
        .range([0, comparisonInnerHeight])
        .padding(0.26);

    timeXScale
        .domain(dataAll.history.map(function(d) { return d.year; }))
        .range([0, viewport.time.width - timeMargin.left - timeMargin.right])
        .padding(0.15);

    timeYScale
        .domain([20, 55])
        .range([viewport.time.height - timeMargin.top - timeMargin.bottom, 0]);
}
