// Generated with GenAI (Claude Opus 5.5) for the direct labels planned in the Design Book (Section 3.2)

// Move labels apart so no two are closer than minGap, keeping each as near to its mark as possible.
// Each label is an object with a target y position; the function adds the final labelY.
const spreadLabels = (labels, minGap, minY, maxY) => {
    const sorted = labels.slice().sort((a, b) => a.y - b.y);

    // Push each label down below the one above it
    sorted.forEach((label, i) => {
        label.labelY = i === 0 ? Math.max(label.y, minY) : Math.max(label.y, sorted[i - 1].labelY + minGap);
    });

    // If the last label left the chart, push the labels back up from the bottom
    for (let i = sorted.length - 1; i >= 0; i--) {
        const limit = i === sorted.length - 1 ? maxY : sorted[i + 1].labelY - minGap;
        sorted[i].labelY = Math.min(sorted[i].labelY, limit);
    }
    return labels;
};

// On narrow screens the direct labels and the SVG keys would be too wide, so CSS hides them and shows this
// HTML key below the chart instead (Design Book Figure 3.2: on a phone, labels sit under the chart)
const createHtmlKey = (containerId, items) => {
    const keyItems = d3.select(`#${containerId}`)
        .append("ul")
            .attr("class", "html-key")
        .selectAll("li")
        .data(items)
        .join("li");
    keyItems
        .append("span")
            .attr("class", d => `html-key-swatch ${d.hollow ? "hollow" : ""}`)
            .style("background-color", d => d.hollow ? "white" : d.color)
            .style("border-color", d => d.color);
    keyItems
        .append("span")
            .text(d => d.label);
};
