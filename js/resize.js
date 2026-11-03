// Generated with GenAI (Claude Opus 5.5), following resize.js in the Week 8 Chart Accessibility lecture (Dufour & Meeks, 2024)

// Accessibility: keep chart text at least 12px on a phone by scaling the SVG font with the window width
const resizeCharts = () => {
    const windowWidth = window.innerWidth;
    chartFontSize = fontSizeScale(windowWidth);
    tooltipFontSize = chartFontSize;

    // Resize the axis, annotation and label text of every chart
    d3.selectAll(".tick text, .axis-label, .annotation-label, .direct-label, .key-label")
        .style("font-size", `${chartFontSize}px`);

    // Keep the top axis label inside the SVG
    d3.selectAll(".axis-label-left")
        .attr("y", chartFontSize + 4);

    // Let each chart move its labels and keys for the new text size
    chartResizeHandlers.forEach(handler => handler());
};

window.addEventListener("resize", () => {
    resizeCharts();
});
