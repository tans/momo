class LineChart {
  /**
   * Construct with the given `config`.
   */

  constructor(config) {
    this.set(config);
    this.init();
  }
  defaults = {
    // target element or selector to contain the svg
    target: "#chart",

    // width of chart
    width: 550,

    // height of chart
    height: 170,

    // margin
    margin: { top: 15, right: 0, bottom: 35, left: 60 },

    // axis padding
    axisPadding: 5,

    // axis tick size
    tickSize: 0,

    // number of x-axis ticks
    xTicks: 5,

    // number of y-axis ticks
    yTicks: 3,

    // nice round values for axis
    nice: false,

    // line interpolation
    interpolate: "curveBasis"
  };
  /**
   * Set configuration options.
   */

  set(config) {
    Object.assign(this, this.defaults, config);
  }

  /**
   * Dimensions without margin.
   */

  dimensions() {
    const { width, height, margin } = this;
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    return [w, h];
  }

  /**
   * Initialize the chart.
   */

  init() {
    const { target, width, height, margin, axisPadding, interpolate } = this;
    const { tickSize, xTicks, yTicks } = this;
    const [w, h] = this.dimensions();

    this.chart = d3
      .select(target)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    this.x = d3.scaleTime().range([0, w]);

    this.y = d3.scaleLinear().range([h, 0]);

    this.xAxis = d3
      .axisBottom()
      .scale(this.x)
      .ticks(xTicks)
      .tickPadding(8)
      .tickSize(tickSize);

    this.yAxis = d3
      .axisLeft()
      .scale(this.y)
      .ticks(yTicks)
      .tickPadding(8)
      .tickSize(tickSize);

    this.chart
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${h + axisPadding})`)
      .call(this.xAxis);

    this.chart
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${-axisPadding}, 0)`)
      .call(this.yAxis);

    this.line = d3
      .line()
      .x(d => this.x(d.time))
      .y(d => this.y(d.value))
      .curve(d3[interpolate]);

    this.chart.append("path").attr("class", "line");
  }

  /**
   * Render axis.
   */

  renderAxis(data, options) {
    const { chart, x, y, xAxis, yAxis, nice } = this;

    const xd = x.domain(d3.extent(data, d => d.time));
    const yd = y.domain(d3.extent(data, d => d.value));

    if (nice) {
      xd.nice();
      yd.nice();
    }

    const c = options.animate ? chart.transition() : chart;

    c.select(".x.axis").call(xAxis);
    c.select(".y.axis").call(yAxis);
  }

  /**
   * Render columns.
   */

  renderCols(data) {
    const { chart, x, y } = this;
    const [w, h] = this.dimensions();

    const column = chart.selectAll(".column").data(data);

    // enter
    column
      .enter()
      .append("rect")
      .attr("class", "column");

    // update
    column
      .attr("width", 1)
      .attr("height", d => h)
      .attr("x", d => x(d.time))
      .attr("y", 0);

    // exit
    column.exit().remove();
  }

  /**
   * Render line.
   */

  renderLine(data) {
    const chart = this.chart.transition();
    const { line } = this;

    chart.select(".line").attr("d", line(data));

    // hack: fixes order
    chart.node().appendChild(chart.select(".line").node());
  }

  /**
   * Render the chart against the given `data`.
   */

  render(data, options = {}) {
    this.renderAxis(data, options);
    this.renderCols(data, options);
    this.renderLine(data, options);
  }

  /**
   * Update the chart against the given `data`.
   */

  update(data) {
    this.render(data, {
      animate: true
    });
  }
}

/**
 * Zeroed margin.
 */

const zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 };

/**
 * BarChart.
 */

class BarChart {
  /**
   * Construct with the given `config`.
   */

  constructor(config) {
    this.set(config);
    if (!this.axis) this.margin = zeroMargin;
    this.init();
  }
  defaults = {
    // target element or selector to contain the svg
    target: "#chart",

    // width of chart
    width: 500,

    // height of chart
    height: 130,

    // margin
    margin: { top: 15, right: 0, bottom: 35, left: 60 },

    // enable axis
    axis: true,

    // axis padding
    axisPadding: 5,

    // axis tick size
    tickSize: 10,

    // padding between bars
    barPadding: 13,

    // nice round values for axis
    nice: false,

    // custom x domain
    xDomain: null,

    // custom y domain
    yDomain: null,

    // color range
    color: null,

    // color interpolation
    colorInterpolate: d3.interpolateHcl,

    // easing function for transitions
    ease: "easeLinear",

    // type of bar: rounded-rect, rect
    type: "rounded",

    // mouseover callback for tooltips or value display
    mouseover: _ => {},

    // mouseout callback for tooltips or value display
    mouseout: _ => {}
  };
  /**
   * Set configuration options.
   */

  set(config) {
    Object.assign(this, this.defaults, config);
  }

  /**
   * Dimensions without margin.
   */

  dimensions() {
    const { width, height, margin } = this;
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    return [w, h];
  }

  /**
   * Handle mouseover.
   */

  onMouseOver() {
    const m = d3.mouse(this.chart.node());
    const x = this.x.invert(m[0]);
    const i = this.xBisect(this.data, x, 1);
    const data = this.data[i - 1];
    this.mouseover(data);
  }

  /**
   * Handle mouseleave.
   */

  onMouseLeave() {
    this.mouseout();
  }

  /**
   * Initialize the chart.
   */

  init() {
    const { target, width, height, margin, axisPadding, tickSize, axis } = this;
    const { color, colorInterpolate } = this;
    const [w, h] = this.dimensions();

    this.chart = d3
      .select(target)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .on("mouseover", _ => this.onMouseOver())
      .on("mouseleave", _ => this.onMouseLeave());

    if (color) {
      this.color = d3
        .scaleLinear()
        .interpolate(colorInterpolate)
        .range(color);
    }

    this.x = d3.scaleTime().range([0, w]);

    this.y = d3.scaleLinear().range([h, 0]);

    this.xAxis = d3
      .axisBottom()
      .scale(this.x)
      .ticks(5)
      .tickPadding(8)
      .tickSize(tickSize);

    this.yAxis = d3
      .axisLeft()
      .scale(this.y)
      .ticks(3)
      .tickPadding(8)
      .tickSize(tickSize);

    if (axis) {
      this.chart
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${h + axisPadding})`)
        .call(this.xAxis);

      this.chart
        .append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${-axisPadding}, 0)`)
        .call(this.yAxis);
    }

    this.xBisect = d3.bisector(d => d.bin).left;

    this.ease = d3[this.ease];
  }

  /**
   * Render axis.
   */

  renderAxis(data, options) {
    const {
      chart,
      x,
      y,
      xAxis,
      yAxis,
      nice,
      t,
      color,
      xDomain,
      yDomain
    } = this;

    const yExtent = yDomain || d3.extent(data, d => d.value);

    const xd = x.domain(xDomain || d3.extent(data, d => d.bin));
    const yd = y.domain([yExtent[0], yExtent[1] > 20 ? yExtent[1] : 20]);

    if (color) color.domain(yExtent);

    if (nice) {
      xd.nice();
      yd.nice();
    }

    const c = chart.transition(t);
    c.select(".x.axis").call(xAxis);
    c.select(".y.axis").call(yAxis);
  }

  /**
   * Render bars.
   */

  renderBars(data, { animate }) {
    const { chart, x, y, t, barPadding, type, color } = this;
    const [w, h] = this.dimensions();

    const width = w / data.length;
    const barWidth = width - barPadding;
    if (barWidth < 1)
      throw new Error("BarChart is too small for the amount of data provided");

    const column = chart.selectAll(".column").data(data);

    column
      .enter() // enter
      .append("rect")
      .attr("class", "column")
      .merge(column) // update
      .transition(t)
      .attr("x", d => x(d.bin))
      .attr("rx", type == "rounded" ? barWidth / 2 : 0)
      .attr("ry", type == "rounded" ? barWidth / 2 : 0)
      .attr("width", barWidth)
      .attr("height", h);

    // exit
    column.exit().remove();

    const bar = chart.selectAll(".bar").data(data);

    bar
      .enter() // enter
      .append("rect")
      .attr("class", "bar")
      .merge(bar) // update
      .transition(t)
      .attr("x", d => x(d.bin))
      .attr("y", d => y(d.value))
      .attr("rx", type == "rounded" ? barWidth / 2 : 0)
      .attr("ry", type == "rounded" ? barWidth / 2 : 0)
      .attr("width", barWidth)
      .attr("height", d => h - y(d.value));

    if (color) bar.style("fill", d => color(d.value));

    // exit
    bar.exit().remove();

    const overlay = chart.selectAll(".overlay").data(data);

    // enter
    overlay
      .enter()
      .append("rect")
      .attr("class", "overlay");

    // update
    overlay
      .attr("x", d => x(d.bin))
      .attr("width", width)
      .attr("height", h)
      .style("fill", "transparent");

    // exit
    overlay.exit().remove();
  }

  /**
   * Render the chart against the given `data` which should be
   * an array of objects with `bin` and `value` properties.
   */

  render(data, options = {}) {
    this.data = data;

    this.t = d3
      .transition()
      .duration(options.animate ? 300 : 0)
      .ease(this.ease);

    this.renderAxis(data, options);
    this.renderBars(data, options);
  }

  /**
   * Update the chart against the given `data`.
   */

  update(data, options = { animate: true }) {
    this.render(data, options);
  }
}
