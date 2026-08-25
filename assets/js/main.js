/* --- ビューポート --- */
const viewport = {
    comparison: {width: 920, height: 820},
    time: {width: 720, height: 410}
};

const comparisonMargin = {top: 42, right: 54, bottom: 52, left: 104};
const timeMargin = {top: 38, right: 54, bottom: 52, left: 62};

/* --- データセット --- */
const dataAll = {
    cities: [],
    history: []
};

/* --- ステータス --- */
const dimensions = [
    {label: "割合で比較", value: "share", accessor: "singleShare", rank: "shareRank"},
    {label: "世帯数で比較", value: "count", accessor: "singleHouseholds", rank: "countRank"}
];

const categories = [
    {key: "single", label: "単独世帯"},
    {key: "coupleWithChildren", label: "夫婦と子ども"},
    {key: "coupleOnly", label: "夫婦のみ"},
    {key: "singleParent", label: "ひとり親と子ども"},
    {key: "other", label: "その他"}
];

const trendSeries = [
    {key: "single", label: "単独世帯"},
    {key: "coupleWithChildren", label: "夫婦と子ども"}
];

const state = {
    metric: "share",
    selectedCity: "調布市",
    hoveredCity: null,
    selectedYear: 2020,
    hoveredYear: null
};

/* --- スケール --- */
const comparisonXScale = d3.scaleLinear();
const comparisonYScale = d3.scaleBand();
const timeXScale = d3.scalePoint();
const timeYScale = d3.scaleLinear();

/* --- 共通関数 --- */
const formatInteger = new Intl.NumberFormat("ja-JP");

function formatShare(value) {
    return `${Number(value).toFixed(1)}%`;
}

function getMetric() {
    return dimensions.find(function(dimension) {
        return dimension.value === state.metric;
    });
}

function getActiveCityName() {
    return state.hoveredCity || state.selectedCity;
}

function getActiveYear() {
    return state.hoveredYear || state.selectedYear;
}

function getReducedMotionDuration(duration) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

/* --- 01. 表示領域の計算 --- */
function getWindowSize() {
    const comparisonWrap = document.querySelector("#comparisonChartWrap");
    const timeWrap = document.querySelector("#timeChartWrap");

    viewport.comparison.width = Math.max(320, Math.round(comparisonWrap.getBoundingClientRect().width));
    viewport.comparison.height = (
        comparisonMargin.top
        + comparisonMargin.bottom
        + (viewport.comparison.width < 640 ? 26 : 28) * dataAll.cities.length
    );

    viewport.time.width = Math.max(320, Math.round(timeWrap.getBoundingClientRect().width));
    viewport.time.height = viewport.time.width < 560 ? 330 : 410;

    comparisonMargin.left = viewport.comparison.width < 640 ? 78 : 104;
    comparisonMargin.right = viewport.comparison.width < 640 ? 26 : 54;
    timeMargin.left = viewport.time.width < 560 ? 48 : 62;
    timeMargin.right = viewport.time.width < 560 ? 24 : 54;
}

/* --- 02. SVGの初期化 --- */
function initViewport() {
    d3.select("#comparisonChart")
        .attr("viewBox", `0 0 ${viewport.comparison.width} ${viewport.comparison.height}`)
        .attr("height", viewport.comparison.height);

    d3.select("#timeChart")
        .attr("viewBox", `0 0 ${viewport.time.width} ${viewport.time.height}`);
}

/* --- 03. データの読み込みと型変換 --- */
async function loadParseData() {
    const files = await Promise.all([
        d3.csv("assets/data/tama-single-households.csv", function(d) {
            return {
                code: d.code,
                city: d.city,
                generalHouseholds: Number(d.generalHouseholds),
                singleHouseholds: Number(d.singleHouseholds),
                singleShare: Number(d.singleShare),
                shareRank: Number(d.shareRank),
                countRank: Number(d.countRank)
            };
        }),
        d3.csv("assets/data/chofu-household-history.csv", function(d) {
            return {
                year: Number(d.year),
                coupleOnly: Number(d.coupleOnly),
                coupleWithChildren: Number(d.coupleWithChildren),
                singleParent: Number(d.singleParent),
                single: Number(d.single),
                other: Number(d.other)
            };
        })
    ]);

    dataAll.cities = files[0];
    dataAll.history = files[1].sort(function(a, b) {
        return d3.ascending(a.year, b.year);
    });

    if (dataAll.cities.length !== 26) {
        throw new Error(`東京都の市データは26件の想定ですが、${dataAll.cities.length}件でした。`);
    }

    if (!dataAll.history.length) {
        throw new Error("調布市の時系列データを読み込めませんでした。");
    }
}

/* --- 04. 操作UIの初期化 --- */
function initControls() {
    d3.selectAll(".metric-toggle button")
        .on("click", function(event) {
            state.metric = event.currentTarget.dataset.metric;
            setScales();
            renderComparison();
        });

    const citySelect = d3.select("#citySelect");
    citySelect.selectAll("option")
        .data(dataAll.cities, function(d) { return d.code; })
        .join("option")
        .attr("value", function(d) { return d.city; })
        .text(function(d) { return d.city; });

    citySelect
        .property("value", state.selectedCity)
        .on("change", function(event) {
            state.selectedCity = event.currentTarget.value;
            updateComparisonHighlight();
        });

    d3.select("#yearSelector")
        .selectAll("button")
        .data(dataAll.history, function(d) { return d.year; })
        .join("button")
        .attr("type", "button")
        .attr("class", function(d) {
            return d.year === state.selectedYear ? "is-selected" : null;
        })
        .text(function(d) { return d.year; })
        .on("click", function(event, d) {
            state.selectedYear = d.year;
            updateTimeHighlight();
        });
}

/* --- 05. スケールの設定 --- */
function setScales() {
    const metric = getMetric();
    const comparisonInnerWidth = viewport.comparison.width - comparisonMargin.left - comparisonMargin.right;
    const comparisonInnerHeight = viewport.comparison.height - comparisonMargin.top - comparisonMargin.bottom;
    const sortedCities = dataAll.cities.slice().sort(function(a, b) {
        return d3.descending(a[metric.accessor], b[metric.accessor]);
    });

    const comparisonMax = d3.max(sortedCities, function(d) {
        return d[metric.accessor];
    }) || 1;

    comparisonXScale
        .domain(state.metric === "share" ? [0, 55] : [0, comparisonMax * 1.05])
        .range([0, comparisonInnerWidth]);

    comparisonYScale
        .domain(sortedCities.map(function(d) { return d.city; }))
        .range([0, comparisonInnerHeight])
        .padding(0.26);

    const timeInnerWidth = viewport.time.width - timeMargin.left - timeMargin.right;
    const timeInnerHeight = viewport.time.height - timeMargin.top - timeMargin.bottom;

    timeXScale
        .domain(dataAll.history.map(function(d) { return d.year; }))
        .range([0, timeInnerWidth])
        .padding(0.15);

    timeYScale
        .domain([20, 55])
        .range([timeInnerHeight, 0]);
}

/* --- 06. 100世帯図の描画 --- */
function renderHeroWaffle() {
    const latest = dataAll.history[dataAll.history.length - 1];
    const cells = d3.range(100);
    const cellSize = 19;
    const gap = 7;

    d3.select("#heroWaffle")
        .selectAll("rect")
        .data(cells, function(d) { return d; })
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

/* --- 07. 26市比較の描画 --- */
function renderComparison() {
    const svg = d3.select("#comparisonChart");
    const metric = getMetric();
    const innerHeight = viewport.comparison.height - comparisonMargin.top - comparisonMargin.bottom;
    const sortedCities = dataAll.cities.slice().sort(function(a, b) {
        return d3.descending(a[metric.accessor], b[metric.accessor]);
    });

    const root = svg.selectAll(".comparison-root")
        .data([null])
        .join("g")
        .attr("class", "comparison-root")
        .attr("transform", `translate(${comparisonMargin.left},${comparisonMargin.top})`);

    const ticks = state.metric === "share" ? 6 : (viewport.comparison.width < 640 ? 3 : 5);
    const xAxis = d3.axisTop(comparisonXScale)
        .ticks(ticks)
        .tickSize(-innerHeight)
        .tickFormat(function(value) {
            return state.metric === "share" ? `${value}%` : d3.format("~s")(Number(value));
        });

    root.selectAll(".comparison-x-axis")
        .data([null])
        .join("g")
        .attr("class", "comparison-x-axis chart-axis chart-grid")
        .call(xAxis);

    const yAxis = d3.axisLeft(comparisonYScale)
        .tickSize(0)
        .tickPadding(10);

    root.selectAll(".comparison-y-axis")
        .data([null])
        .join("g")
        .attr("class", "comparison-y-axis chart-axis city-axis")
        .call(yAxis)
        .selectAll("text")
        .attr("class", function(city) {
            return city === "調布市" ? "is-chofu-label" : null;
        });

    if (state.metric === "share") {
        const shareMedian = d3.median(dataAll.cities, function(d) { return d.singleShare; });
        const medianGroup = root.selectAll(".median-group")
            .data([shareMedian])
            .join("g")
            .attr("class", "median-group");

        medianGroup.selectAll("line")
            .data(function(value) { return [value]; })
            .join("line")
            .attr("x1", function(value) { return comparisonXScale(value); })
            .attr("x2", function(value) { return comparisonXScale(value); })
            .attr("y1", 0)
            .attr("y2", innerHeight);

        medianGroup.selectAll("text")
            .data(function(value) { return [value]; })
            .join("text")
            .attr("x", function(value) { return comparisonXScale(value) + 6; })
            .attr("y", -18)
            .text(function(value) { return `26市中央値 ${value.toFixed(1)}%`; });
    } else {
        root.selectAll(".median-group").remove();
    }

    const duration = getReducedMotionDuration(500);
    const transition = d3.transition().duration(duration).ease(d3.easeCubicOut);

    root.selectAll(".city-stem")
        .data(sortedCities, function(d) { return d.code; })
        .join("line")
        .attr("class", "city-stem")
        .attr("x1", comparisonXScale(0))
        .attr("y1", function(d) {
            return comparisonYScale(d.city) + comparisonYScale.bandwidth() / 2;
        })
        .attr("y2", function(d) {
            return comparisonYScale(d.city) + comparisonYScale.bandwidth() / 2;
        })
        .transition(transition)
        .attr("x2", function(d) { return comparisonXScale(d[metric.accessor]); });

    root.selectAll(".city-dot")
        .data(sortedCities, function(d) { return d.code; })
        .join("circle")
        .attr("class", "city-dot")
        .attr("cy", function(d) {
            return comparisonYScale(d.city) + comparisonYScale.bandwidth() / 2;
        })
        .transition(transition)
        .attr("cx", function(d) { return comparisonXScale(d[metric.accessor]); });

    root.selectAll(".city-hit")
        .data(sortedCities, function(d) { return d.code; })
        .join("circle")
        .attr("class", "city-hit")
        .attr("r", 12)
        .attr("cx", function(d) { return comparisonXScale(d[metric.accessor]); })
        .attr("cy", function(d) {
            return comparisonYScale(d.city) + comparisonYScale.bandwidth() / 2;
        })
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr("aria-label", function(d) {
            return `${d.city}、単独世帯割合${formatShare(d.singleShare)}、単独世帯${formatInteger.format(d.singleHouseholds)}世帯`;
        })
        .on("pointerenter focus", function(event, d) {
            state.hoveredCity = d.city;
            updateComparisonHighlight();
        })
        .on("pointerleave blur", function() {
            state.hoveredCity = null;
            updateComparisonHighlight();
        })
        .on("click keydown", function(event, d) {
            if (event.type === "click" || event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                state.selectedCity = d.city;
                d3.select("#citySelect").property("value", d.city);
                updateComparisonHighlight();
            }
        });

    updateComparisonHighlight();
}

function updateComparisonHighlight() {
    const metric = getMetric();
    const activeCityName = getActiveCityName();
    const active = dataAll.cities.find(function(d) { return d.city === activeCityName; });
    const chofu = dataAll.cities.find(function(d) { return d.city === "調布市"; });
    const shareMedian = d3.median(dataAll.cities, function(d) { return d.singleShare; });

    if (!active || !chofu) {
        return;
    }

    const root = d3.select("#comparisonChart").select(".comparison-root");
    root.selectAll(".city-dot")
        .attr("class", function(d) {
            const classes = ["city-dot"];
            if (d.city === "調布市") classes.push("is-chofu");
            if (d.city === activeCityName) classes.push("is-active");
            return classes.join(" ");
        })
        .attr("r", function(d) {
            if (d.city === "調布市") return 7;
            return d.city === activeCityName ? 6.5 : 4.3;
        });

    const labels = dataAll.cities.filter(function(d) {
        return d.city === "調布市" || d.city === activeCityName;
    });

    root.selectAll(".city-value-label")
        .data(labels, function(d) { return d.code; })
        .join("text")
        .attr("class", function(d) {
            return d.city === "調布市" ? "city-value-label is-chofu" : "city-value-label";
        })
        .attr("x", function(d) { return comparisonXScale(d[metric.accessor]) + 11; })
        .attr("y", function(d) {
            return comparisonYScale(d.city) + comparisonYScale.bandwidth() / 2 + 4;
        })
        .text(function(d) {
            return state.metric === "share"
                ? formatShare(d.singleShare)
                : formatInteger.format(d.singleHouseholds);
        });

    const activeValue = state.metric === "share"
        ? formatShare(active.singleShare)
        : `${formatInteger.format(active.singleHouseholds)}世帯`;
    const activeRank = active[metric.rank];

    d3.select("#activeCityName").text(active.city);
    d3.select("#activeCityValue").text(activeValue);
    d3.select("#activeCityRank").text(`${activeRank}位`);

    if (active.city === "調布市") {
        d3.select("#activeCityNote").text(
            state.metric === "share"
                ? `中央値より${(chofu.singleShare - shareMedian).toFixed(1)}ポイント高い`
                : "総数では3位。都市の規模も反映する"
        );
    } else {
        const gap = state.metric === "share"
            ? active.singleShare - chofu.singleShare
            : active.singleHouseholds - chofu.singleHouseholds;
        const gapText = state.metric === "share"
            ? `${gap >= 0 ? "+" : ""}${gap.toFixed(1)}ポイント`
            : `${gap >= 0 ? "+" : ""}${formatInteger.format(gap)}世帯`;
        d3.select("#activeCityNote").text(`調布市との差 ${gapText}`);
    }

    d3.selectAll(".metric-toggle button")
        .classed("is-selected", function() {
            return this.dataset.metric === state.metric;
        });
}

/* --- 08. 時系列の描画 --- */
function renderTimeSeries() {
    const svg = d3.select("#timeChart");
    const innerWidth = viewport.time.width - timeMargin.left - timeMargin.right;
    const innerHeight = viewport.time.height - timeMargin.top - timeMargin.bottom;
    const activeYear = getActiveYear();

    const root = svg.selectAll(".time-root")
        .data([null])
        .join("g")
        .attr("class", "time-root")
        .attr("transform", `translate(${timeMargin.left},${timeMargin.top})`);

    root.selectAll(".time-y-axis")
        .data([null])
        .join("g")
        .attr("class", "time-y-axis chart-axis chart-grid")
        .call(
            d3.axisLeft(timeYScale)
                .ticks(7)
                .tickSize(-innerWidth)
                .tickFormat(function(value) { return `${value}%`; })
        );

    root.selectAll(".time-x-axis")
        .data([null])
        .join("g")
        .attr("class", "time-x-axis chart-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(
            d3.axisBottom(timeXScale)
                .tickSizeOuter(0)
                .tickPadding(10)
                .tickFormat(function(value) { return `${value}`; })
        );

    root.selectAll(".half-line")
        .data([50])
        .join("line")
        .attr("class", "half-line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", timeYScale)
        .attr("y2", timeYScale);

    root.selectAll(".half-label")
        .data([50])
        .join("text")
        .attr("class", "half-label")
        .attr("x", innerWidth)
        .attr("y", function(value) { return timeYScale(value) - 9; })
        .attr("text-anchor", "end")
        .text("2世帯に1世帯 = 50%");

    function lineFor(key) {
        return d3.line()
            .x(function(d) { return timeXScale(d.year); })
            .y(function(d) { return timeYScale(d[key]); })
            .curve(d3.curveMonotoneX);
    }

    root.selectAll(".time-series-line")
        .data(trendSeries, function(d) { return d.key; })
        .join("path")
        .attr("class", function(d) { return `time-series-line time-line-${d.key}`; })
        .attr("d", function(d) { return lineFor(d.key)(dataAll.history); });

    const pointData = dataAll.history.flatMap(function(datum) {
        return trendSeries.map(function(series) {
            return {datum: datum, series: series};
        });
    });

    root.selectAll(".time-series-point")
        .data(pointData, function(d) { return `${d.series.key}-${d.datum.year}`; })
        .join("circle")
        .attr("cx", function(d) { return timeXScale(d.datum.year); })
        .attr("cy", function(d) { return timeYScale(d.datum[d.series.key]); });

    root.selectAll(".time-hit")
        .data(dataAll.history, function(d) { return d.year; })
        .join("circle")
        .attr("class", "time-hit")
        .attr("cx", function(d) { return timeXScale(d.year); })
        .attr("cy", function(d) { return timeYScale(d.single); })
        .attr("r", 15)
        .attr("tabindex", 0)
        .attr("role", "button")
        .attr("aria-label", function(d) {
            return `${d.year}年、単独世帯割合${d.single.toFixed(1)}%`;
        })
        .on("pointerenter focus", function(event, d) {
            state.hoveredYear = d.year;
            updateTimeHighlight();
        })
        .on("pointerleave blur", function() {
            state.hoveredYear = null;
            updateTimeHighlight();
        })
        .on("click keydown", function(event, d) {
            if (event.type === "click" || event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                state.selectedYear = d.year;
                updateTimeHighlight();
            }
        });

    updateTimeHighlight();
}

function updateTimeHighlight() {
    const activeYear = getActiveYear();
    const active = dataAll.history.find(function(d) { return d.year === activeYear; });
    const root = d3.select("#timeChart").select(".time-root");

    if (!active) {
        return;
    }

    root.selectAll(".time-series-point")
        .attr("class", function(d) {
            const activeClass = d.datum.year === activeYear ? " is-active" : "";
            return `time-series-point time-point-${d.series.key}${activeClass}`;
        })
        .attr("r", function(d) {
            return d.datum.year === activeYear ? 6.5 : 4.5;
        });

    const labels = trendSeries.map(function(series) {
        return {
            key: series.key,
            label: series.label,
            datum: active,
            value: active[series.key]
        };
    });

    root.selectAll(".time-value")
        .data(labels, function(d) { return d.key; })
        .join("text")
        .attr("class", function(d) { return `time-value time-value-${d.key}`; })
        .attr("x", function(d) { return timeXScale(d.datum.year); })
        .attr("y", function(d) {
            return timeYScale(d.value) + (d.key === "single" ? -16 : 21);
        })
        .attr("text-anchor", active.year === 2020 ? "end" : (active.year === 1995 ? "start" : "middle"))
        .text(function(d) { return `${d.label} ${d.value.toFixed(1)}%`; });

    d3.select("#yearSelector")
        .selectAll("button")
        .classed("is-selected", function(d) {
            return d.year === state.selectedYear;
        });

    renderYearDetail();
}

/* --- 09. 選択年の詳細描画 --- */
function renderYearDetail() {
    const activeYear = getActiveYear();
    const active = dataAll.history.find(function(d) { return d.year === activeYear; });
    const first = dataAll.history[0];

    if (!active || !first) {
        return;
    }

    d3.select("#detailYear").text(`${active.year}年`);
    d3.select("#detailShare").text(active.single.toFixed(1));
    d3.select("#changeNote").text(
        `1995年から ${active.single - first.single >= 0 ? "+" : ""}${(active.single - first.single).toFixed(1)}ポイント`
    );
    d3.select("#detailWaffle")
        .attr("aria-label", `${active.year}年の単独世帯割合を100世帯に見立てた図`);
    d3.select("#composition")
        .attr("aria-label", `${active.year}年の世帯類型別構成`);

    d3.select("#detailWaffle")
        .selectAll("rect")
        .data(d3.range(100), function(d) { return d; })
        .join("rect")
        .attr("x", function(d) { return (d % 10) * 23; })
        .attr("y", function(d) { return Math.floor(d / 10) * 23; })
        .attr("width", 16)
        .attr("height", 16)
        .attr("rx", 4)
        .transition()
        .duration(getReducedMotionDuration(350))
        .attr("class", function(d) {
            return d < Math.round(active.single) ? "waffle-cell is-single" : "waffle-cell";
        });

    d3.select("#compositionBar")
        .selectAll("span")
        .data(categories, function(d) { return d.key; })
        .join("span")
        .attr("class", function(d) { return `segment segment-${d.key}`; })
        .style("width", function(d) { return `${active[d.key]}%`; });

    const rows = d3.select("#compositionList")
        .selectAll("div")
        .data(categories, function(d) { return d.key; })
        .join(function(enter) {
            const row = enter.append("div");
            const term = row.append("dt");
            term.append("i");
            term.append("span");
            row.append("dd");
            return row;
        });

    rows.select("dt i")
        .attr("class", function(d) { return `legend-${d.key}`; });
    rows.select("dt span")
        .text(function(d) { return d.label; });
    rows.select("dd")
        .text(function(d) { return `${active[d.key].toFixed(1)}%`; });
}

/* --- 10. 画面幅変更への対応 --- */
function bindInteractions() {
    let scheduledFrame = null;

    const renderAtNewSize = function() {
        if (scheduledFrame !== null) {
            cancelAnimationFrame(scheduledFrame);
        }

        scheduledFrame = requestAnimationFrame(function() {
            getWindowSize();
            initViewport();
            setScales();
            renderComparison();
            renderTimeSeries();
            scheduledFrame = null;
        });
    };

    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(renderAtNewSize);
        observer.observe(document.querySelector("#comparisonChartWrap"));
        observer.observe(document.querySelector("#timeChartWrap"));
    } else {
        window.addEventListener("resize", renderAtNewSize);
    }
}

/* --- アプリケーションの開始 --- */
async function initApp() {
    await loadParseData();
    await runSteps([
        getWindowSize,
        initViewport,
        initControls,
        setScales,
        renderHeroWaffle,
        renderComparison,
        renderTimeSeries,
        renderYearDetail,
        bindInteractions
    ]);
}

async function runSteps(steps) {
    for (const step of steps) {
        await step();
    }
}

initApp().catch(function(error) {
    console.error(error);
    d3.select("main")
        .insert("p", ":first-child")
        .attr("class", "load-error")
        .text("データを読み込めませんでした。Live Serverまたは公開URLから開いてください。");
});
