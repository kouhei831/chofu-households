/* --- ビューポート --- */
const viewport = {
    comparison: {width: 920, height: 820},
    time: {width: 720, height: 410}
};

const comparisonMargin = {top: 42, right: 54, bottom: 52, left: 104};
const timeMargin = {top: 38, right: 54, bottom: 52, left: 62};

function getWindowSize() {
    const comparisonWrap = document.querySelector("#comparisonChartWrap");
    const timeWrap = document.querySelector("#timeChartWrap");

    viewport.comparison.width = Math.max(320, Math.round(comparisonWrap.getBoundingClientRect().width));
    viewport.comparison.height = comparisonMargin.top + comparisonMargin.bottom
        + (viewport.comparison.width < 640 ? 26 : 28) * dataAll.cities.length;

    viewport.time.width = Math.max(320, Math.round(timeWrap.getBoundingClientRect().width));
    viewport.time.height = viewport.time.width < 560 ? 330 : 410;
}
