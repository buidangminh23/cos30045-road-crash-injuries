// Generated with GenAI (Claude Opus 5.5), following the Week 8 Chart Accessibility lecture (Dufour & Meeks, 2024, chapter 6)

// Accessibility: a live region so screen readers announce the tooltip text (Week 8 "screen reader announcement")
const announceToScreenReader = (text) => {
    if (!document.getElementById("tooltip-announcer")) {
        const announcer = document.createElement("div");
        announcer.id = "tooltip-announcer";
        announcer.setAttribute("aria-live", "polite");
        announcer.className = "sr-only";   // visually hidden with CSS
        document.body.appendChild(announcer);
    }
    document.getElementById("tooltip-announcer").textContent = text;
};

// Accessibility: role="img" with a short <title> and a longer <desc>, read by screen readers instead of every tick label
const describeChart = (svg, chartId, title, description) => {
    svg
        .attr("role", "img")
        .attr("aria-labelledby", `${chartId}-title ${chartId}-desc`);
    svg
        .append("title")
            .attr("id", `${chartId}-title`)
            .text(title);
    svg
        .append("desc")
            .attr("id", `${chartId}-desc`)
            .text(description);
};

// Accessibility: move the keyboard focus to the next or previous mark of the same kind
const focusSiblingMark = (current, step) => {
    const markClass = current.classList[0];
    let sibling = step > 0 ? current.nextElementSibling : current.previousElementSibling;
    while (sibling && !(sibling.classList.contains(markClass) && sibling.getAttribute("tabindex") === "0")) {
        sibling = step > 0 ? sibling.nextElementSibling : sibling.previousElementSibling;
    }
    if (sibling) {
        sibling.focus();
    }
};

// Accessibility: the same tooltip for mouse, touch and keyboard users.
// Marks can be reached with Tab, the arrow keys move between them, and each mark has an aria-label.
const makeMarksAccessible = (marks, ariaLabel, showTooltip, hideTooltip) => {
    // role="img" lets each mark carry an aria-label: Lighthouse reported aria-label on a plain
    // <circle> or <rect> as a prohibited attribute
    marks
        .attr("tabindex", 0)
        .attr("role", "img")
        .attr("aria-label", ariaLabel)
        .on("mouseenter", showTooltip)
        .on("mouseleave", hideTooltip)
        .on("focus", showTooltip)      // Show the tooltip when the mark is reached with the Tab key
        .on("blur", hideTooltip)       // Hide it when the focus moves away
        .on("keydown", (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                focusSiblingMark(e.target, 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                focusSiblingMark(e.target, -1);
            }
        });
};
