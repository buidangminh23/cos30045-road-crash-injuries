document.documentElement.classList.add("js");

const animateCount = (el) => {
    const target = +el.dataset.count;
    const decimals = +(el.dataset.decimals || 0);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const format = d3.format(decimals ? `,.${decimals}f` : ",");
    if (prefersReducedMotion) {
        el.textContent = `${prefix}${format(target)}${suffix}`;
        return;
    }
    d3.select(el)
        .transition()
        .duration(1400)
        .ease(d3.easeCubicOut)
        .tween("text", () => {
            const interpolate = d3.interpolateNumber(0, target);
            return t => { el.textContent = `${prefix}${format(interpolate(t))}${suffix}`; };
        });
};

const drawHeroSpark = (data) => {
    const width = 360;
    const height = 120;
    const svg = d3.select("#hero-spark")
        .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("aria-hidden", "true");
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([8, width - 8]);
    const y = d3.scaleLinear().domain([30000, d3.max(data, d => d.hospitalisations)]).range([height - 14, 14]);
    const area = d3.area().x(d => x(d.year)).y0(height).y1(d => y(d.hospitalisations)).curve(d3.curveMonotoneX);
    const line = d3.line().x(d => x(d.year)).y(d => y(d.hospitalisations)).curve(d3.curveMonotoneX);
    const gradient = svg.append("defs").append("linearGradient").attr("id", "spark-gradient").attr("x1", 0).attr("x2", 0).attr("y1", 0).attr("y2", 1);
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#7fb3ff").attr("stop-opacity", 0.45);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#7fb3ff").attr("stop-opacity", 0);
    svg.append("path").attr("d", area(data)).attr("fill", "url(#spark-gradient)");
    const path = svg.append("path").attr("d", line(data)).attr("fill", "none").attr("stroke", "#cfe2ff").attr("stroke-width", 3);
    const length = path.node().getTotalLength();
    path.attr("stroke-dasharray", `${length} ${length}`).attr("stroke-dashoffset", prefersReducedMotion ? 0 : length)
        .transition().duration(motionDuration(1600)).ease(d3.easeCubicOut).attr("stroke-dashoffset", 0);
    const last = data[data.length - 1];
    svg.append("circle").attr("cx", x(last.year)).attr("cy", y(last.hospitalisations)).attr("r", 5).attr("fill", "#ffb199");
    const covid = data.find(d => d.year === 2020);
    svg.append("circle").attr("cx", x(covid.year)).attr("cy", y(covid.hospitalisations)).attr("r", 4).attr("fill", "#0b1f3a").attr("stroke", "#cfe2ff").attr("stroke-width", 2);
};

const setupScrollUi = () => {
    const progress = document.querySelector(".scroll-progress");
    const links = [...document.querySelectorAll(".site-nav a")];
    const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);

    const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
        return;
    }
    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            links.forEach(link => {
                const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
                link.classList.toggle("is-current", isCurrent);
                if (isCurrent) {
                    link.setAttribute("aria-current", "true");
                    const scroller = link.closest("ul");
                    if (scroller && scroller.scrollWidth > scroller.clientWidth) {
                        scroller.scrollTo({ left: link.offsetLeft - 16, behavior: prefersReducedMotion ? "auto" : "smooth" });
                    }
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(section => spy.observe(section));

    const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                reveal.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(el => reveal.observe(el));

    const counters = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                counters.unobserve(entry.target);
            }
        });
    });
    document.querySelectorAll("[data-count]").forEach(el => counters.observe(el));
};

document.addEventListener("DOMContentLoaded", setupScrollUi);
