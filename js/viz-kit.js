const accentColor = "#e4572e";
const inkColor = "#0f1f33";
const mutedInk = "#5b6675";
const gridColor = "#e6ebf2";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const motionDuration = (ms) => prefersReducedMotion ? 0 : ms;

const vizTooltip = (() => {
    let node = null;
    const ensure = () => {
        if (!node) {
            node = document.createElement("div");
            node.className = "viz-tooltip";
            node.setAttribute("role", "presentation");
            document.body.appendChild(node);
        }
        return node;
    };
    const place = (x, y) => {
        const el = ensure();
        const box = el.getBoundingClientRect();
        const margin = 12;
        let left = x - box.width / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - box.width - margin));
        let top = y - box.height - 14;
        if (top < margin) {
            top = y + 18;
        }
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
    };
    return {
        show(event, title, rows, swatch) {
            const el = ensure();
            el.innerHTML = "";
            const head = document.createElement("div");
            head.className = "viz-tooltip-title";
            if (swatch) {
                const dot = document.createElement("span");
                dot.className = "viz-tooltip-swatch";
                dot.style.background = swatch;
                head.appendChild(dot);
            }
            head.appendChild(document.createTextNode(title));
            el.appendChild(head);
            rows.forEach(row => {
                const line = document.createElement("div");
                line.className = "viz-tooltip-row";
                const label = document.createElement("span");
                label.textContent = row[0];
                const value = document.createElement("strong");
                value.textContent = row[1];
                line.append(label, value);
                el.appendChild(line);
            });
            el.classList.add("is-visible");
            let x;
            let y;
            if (event && event.type && event.type.startsWith("mouse") && event.clientX !== undefined) {
                x = event.clientX;
                y = event.clientY;
            } else {
                const rect = event.currentTarget ? event.currentTarget.getBoundingClientRect() : event.target.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top;
            }
            place(x, y);
            announceToScreenReader([title, ...rows.map(r => `${r[0]} ${r[1]}`)].join(". "));
        },
        move(event) {
            if (node && node.classList.contains("is-visible") && event.clientX !== undefined) {
                place(event.clientX, event.clientY);
            }
        },
        hide() {
            if (node) {
                node.classList.remove("is-visible");
            }
        }
    };
})();

window.addEventListener("scroll", () => vizTooltip.hide(), { passive: true });

const bindVizTooltip = (marks, getContent) => {
    marks
        .attr("tabindex", 0)
        .attr("role", "img")
        .attr("aria-label", d => {
            const c = getContent(d);
            return [c.title, ...c.rows.map(r => `${r[0]} ${r[1]}`)].join(", ");
        })
        .on("mouseenter focus", (event, d) => {
            const c = getContent(d);
            vizTooltip.show(event, c.title, c.rows, c.swatch);
            d3.select(event.currentTarget).classed("is-hot", true);
        })
        .on("mousemove", (event) => vizTooltip.move(event))
        .on("mouseleave blur", (event) => {
            vizTooltip.hide();
            d3.select(event.currentTarget).classed("is-hot", false);
        })
        .on("keydown", (event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                focusSiblingMark(event.target, 1);
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                focusSiblingMark(event.target, -1);
            } else if (event.key === "Escape") {
                vizTooltip.hide();
            }
        });
};

const createVizSvg = (containerId, width, height) => {
    const svg = d3.select(`#${containerId}`)
        .append("svg")
            .attr("class", "viz-svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("data-vb-width", width);
    fitVizText(svg.node());
    return svg;
};

const fitVizText = (svgNode) => {
    const rendered = svgNode.getBoundingClientRect().width || svgNode.parentNode.getBoundingClientRect().width;
    if (!rendered) {
        return;
    }
    const scale = +svgNode.getAttribute("data-vb-width") / rendered;
    const base = window.innerWidth < 600 ? 12.5 : 13;
    svgNode.style.setProperty("--vb-font", `${(base * scale).toFixed(2)}px`);
    svgNode.style.setProperty("--vb-font-sm", `${(base * 0.9 * scale).toFixed(2)}px`);
    svgNode.style.setProperty("--vb-font-lg", `${(base * 1.35 * scale).toFixed(2)}px`);
    svgNode.style.setProperty("--vb-unit", `${scale.toFixed(3)}`);
};

const refitAllVizText = () => {
    document.querySelectorAll("svg.viz-svg").forEach(fitVizText);
};

if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(() => refitAllVizText());
    window.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".viz-host").forEach(el => observer.observe(el));
    });
} else {
    window.addEventListener("resize", refitAllVizText);
}

const formatPercentChange = (from, to) => {
    const change = ((to - from) / from) * 100;
    return `${change >= 0 ? "+" : "−"}${Math.abs(change).toFixed(0)}%`;
};

const COMPACT_BREAKPOINT = 560;
const vizRegistry = [];

const isCompactViz = (containerId) => {
    const host = document.getElementById(containerId);
    const width = host ? host.getBoundingClientRect().width : window.innerWidth;
    return width > 0 && width < COMPACT_BREAKPOINT;
};

const registerViz = (containerId, draw, data) => {
    const entry = { containerId, draw, data, compact: isCompactViz(containerId) };
    vizRegistry.push(entry);
    draw(data, entry.compact);
};

const redrawChangedViz = () => {
    vizRegistry.forEach(entry => {
        const compact = isCompactViz(entry.containerId);
        if (compact === entry.compact) {
            return;
        }
        entry.compact = compact;
        d3.select(`#${entry.containerId}`).selectAll("svg, .html-key").remove();
        entry.draw(entry.data, compact);
    });
};

let vizResizeTimer = null;
window.addEventListener("resize", () => {
    clearTimeout(vizResizeTimer);
    vizResizeTimer = setTimeout(redrawChangedViz, 150);
});
