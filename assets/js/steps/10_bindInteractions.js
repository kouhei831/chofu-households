function bindInteractions() {
    let scheduledFrame = null;
    const renderAtNewSize = function() {
        if (scheduledFrame !== null) cancelAnimationFrame(scheduledFrame);
        scheduledFrame = requestAnimationFrame(function() {
            getWindowSize();
            initViewport();
            setScales();
            renderComparison();
            renderTimeSeries();
            scheduledFrame = null;
        });
    };

    const observer = new ResizeObserver(renderAtNewSize);
    observer.observe(document.querySelector("#comparisonChartWrap"));
    observer.observe(document.querySelector("#timeChartWrap"));
}
