!(function(t) {
  if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = t();
  else if ("function" == typeof define && define.amd) define([], t);
  else {
    ("undefined" != typeof window
      ? window
      : "undefined" != typeof global
      ? global
      : "undefined" != typeof self
      ? self
      : this
    ).BarChart = t();
  }
})(function() {
  var t = {};
  Object.defineProperty(t, "__esModule", { value: !0 });
  var e = function(t, e) {
      if (Array.isArray(t)) return t;
      if (Symbol.iterator in Object(t))
        return (function(t, e) {
          var i = [],
            n = !0,
            r = !1,
            a = void 0;
          try {
            for (
              var s, o = t[Symbol.iterator]();
              !(n = (s = o.next()).done) &&
              (i.push(s.value), !e || i.length !== e);
              n = !0
            );
          } catch (l) {
            (r = !0), (a = l);
          } finally {
            try {
              !n && o.return && o.return();
            } finally {
              if (r) throw a;
            }
          }
          return i;
        })(t, e);
      throw new TypeError(
        "Invalid attempt to destructure non-iterable instance"
      );
    },
    i = (function() {
      function t(t, e) {
        for (var i = 0; i < e.length; i++) {
          var n = e[i];
          (n.enumerable = n.enumerable || !1),
            (n.configurable = !0),
            "value" in n && (n.writable = !0),
            Object.defineProperty(t, n.key, n);
        }
      }
      return function(e, i, n) {
        return i && t(e.prototype, i), n && t(e, n), e;
      };
    })(),
    n = (function(t) {
      if (t && t.__esModule) return t;
      var e = {};
      if (null != t)
        for (var i in t)
          Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
      return (e.default = t), e;
    })(require("d3")),
    r = {
      target: "#chart",
      width: 500,
      height: 130,
      margin: { top: 15, right: 0, bottom: 35, left: 60 },
      axis: !0,
      axisPadding: 5,
      tickSize: 10,
      barPadding: 13,
      nice: !1,
      xDomain: null,
      yDomain: null,
      color: null,
      colorInterpolate: n.interpolateHcl,
      ease: "easeLinear",
      type: "rounded",
      mouseover: function(t) {},
      mouseout: function(t) {}
    },
    a = { top: 0, right: 0, bottom: 0, left: 0 },
    s = (function() {
      function t(e) {
        !(function(e, i) {
          if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function");
        })(this),
          this.set(e),
          this.axis || (this.margin = a),
          this.init();
      }
      return (
        i(t, [
          {
            key: "set",
            value: function(t) {
              Object.assign(this, r, t);
            }
          },
          {
            key: "dimensions",
            value: function() {
              var t = this.width,
                e = this.height,
                i = this.margin;
              return [t - i.left - i.right, e - i.top - i.bottom];
            }
          },
          {
            key: "onMouseOver",
            value: function() {
              var t = n.mouse(this.chart.node()),
                e = this.x.invert(t[0]),
                i = this.xBisect(this.data, e, 1),
                r = this.data[i - 1];
              this.mouseover(r);
            }
          },
          {
            key: "onMouseLeave",
            value: function() {
              this.mouseout();
            }
          },
          {
            key: "init",
            value: function() {
              var t = this,
                i = this.target,
                r = this.width,
                a = this.height,
                s = this.margin,
                o = this.axisPadding,
                l = this.tickSize,
                u = this.axis,
                h = this.color,
                c = this.colorInterpolate,
                d = this.dimensions(),
                f = e(d, 2),
                v = f[0],
                y = f[1];
              (this.chart = n
                .select(i)
                .attr("width", r)
                .attr("height", a)
                .append("g")
                .attr("transform", "translate(" + s.left + ", " + s.top + ")")
                .on("mouseover", function(e) {
                  return t.onMouseOver();
                })
                .on("mouseleave", function(e) {
                  return t.onMouseLeave();
                })),
                h &&
                  (this.color = n
                    .scaleLinear()
                    .interpolate(c)
                    .range(h)),
                (this.x = n.scaleTime().range([0, v])),
                (this.y = n.scaleLinear().range([y, 0])),
                (this.xAxis = n
                  .axisBottom()
                  .scale(this.x)
                  .ticks(5)
                  .tickPadding(8)
                  .tickSize(l)),
                (this.yAxis = n
                  .axisLeft()
                  .scale(this.y)
                  .ticks(3)
                  .tickPadding(8)
                  .tickSize(l)),
                u &&
                  (this.chart
                    .append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + (y + o) + ")")
                    .call(this.xAxis),
                  this.chart
                    .append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + -o + ", 0)")
                    .call(this.yAxis)),
                (this.xBisect = n.bisector(function(t) {
                  return t.bin;
                }).left),
                (this.ease = n[this.ease]);
            }
          },
          {
            key: "renderAxis",
            value: function(t, e) {
              var i = this.chart,
                r = this.x,
                a = this.y,
                s = this.xAxis,
                o = this.yAxis,
                l = this.nice,
                u = this.t,
                h = this.color,
                c = this.xDomain,
                d =
                  this.yDomain ||
                  n.extent(t, function(t) {
                    return t.value;
                  }),
                f = r.domain(
                  c ||
                    n.extent(t, function(t) {
                      return t.bin;
                    })
                ),
                v = a.domain(d);
              h && h.domain(d), l && (f.nice(), v.nice());
              var y = i.transition(u);
              y.select(".x.axis").call(s), y.select(".y.axis").call(o);
            }
          },
          {
            key: "renderBars",
            value: function(t, i) {
              i.animate;
              var n = this.chart,
                r = this.x,
                a = this.y,
                s = this.t,
                o = this.barPadding,
                l = this.type,
                u = this.color,
                h = this.dimensions(),
                c = e(h, 2),
                d = c[0],
                f = c[1],
                v = d / t.length,
                y = v - o;
              if (y < 1)
                throw new Error(
                  "BarChart is too small for the amount of data provided"
                );
              var m = n.selectAll(".column").data(t);
              m
                .enter()
                .append("rect")
                .attr("class", "column")
                .merge(m)
                .transition(s)
                .attr("x", function(t) {
                  return r(t.bin);
                })
                .attr("rx", "rounded" == l ? y / 2 : 0)
                .attr("ry", "rounded" == l ? y / 2 : 0)
                .attr("width", y)
                .attr("height", f),
                m.exit().remove();
              var x = n.selectAll(".bar").data(t);
              x
                .enter()
                .append("rect")
                .attr("class", "bar")
                .merge(x)
                .transition(s)
                .attr("x", function(t) {
                  return r(t.bin);
                })
                .attr("y", function(t) {
                  return a(t.value);
                })
                .attr("rx", "rounded" == l ? y / 2 : 0)
                .attr("ry", "rounded" == l ? y / 2 : 0)
                .attr("width", y)
                .attr("height", function(t) {
                  return f - a(t.value);
                }),
                u &&
                  x.style("fill", function(t) {
                    return u(t.value);
                  }),
                x.exit().remove();
              var p = n.selectAll(".overlay").data(t);
              p
                .enter()
                .append("rect")
                .attr("class", "overlay"),
                p
                  .attr("x", function(t) {
                    return r(t.bin);
                  })
                  .attr("width", v)
                  .attr("height", f)
                  .style("fill", "transparent"),
                p.exit().remove();
            }
          },
          {
            key: "render",
            value: function(t) {
              var e =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
              (this.data = t),
                (this.t = n
                  .transition()
                  .duration(e.animate ? 300 : 0)
                  .ease(this.ease)),
                this.renderAxis(t, e),
                this.renderBars(t, e);
            }
          },
          {
            key: "update",
            value: function(t) {
              var e =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : { animate: !0 };
              this.render(t, e);
            }
          }
        ]),
        t
      );
    })();
  return (t.default = s), t;
});
