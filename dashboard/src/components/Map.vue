<template>
  <div id="map">
    <div class="story-buttons" role="group" aria-label="questions to be answered">
      <button
        id="progress_confirmed"
        type="button"
        class="btn"
        @click="plotMap('progress_confirmed')"
      >Πρόοδος</button>
      <button id="confirmed" type="button" class="btn" @click="plotMap('confirmed')">Επιβεβαιωμένα</button>
      <button id="deaths" type="button" class="btn" @click="plotMap('deaths')">Θανάτοι</button>
    </div>
    <div id="map__container"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  data() {
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
    const ZOOM_THRESHOLD = [1, 7];
    const OVERLAY_MULTIPLIER = 10;
    const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
    const ZOOM_DURATION = 500;
    const ZOOM_IN_STEP = 2;
    const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
    const HOVER_COLOR = "#C0C0C0";

    return {
      zoom: null,
      svg: null,
      g: null,
      projection: null,
      path: null,
      color: null,
      tooltip: null,
      casesData: [],
      geoData: null,
      WIDTH,
      HEIGHT,
      ZOOM_THRESHOLD,
      OVERLAY_MULTIPLIER,
      OVERLAY_OFFSET,
      ZOOM_DURATION,
      ZOOM_IN_STEP,
      ZOOM_OUT_STEP,
      HOVER_COLOR,
    };
  },
  methods: {
    init() {
      this.svg = d3
        .select("#map__container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

      this.g = this.svg.call(this.zoom).append("g");

      this.g
        .append("rect")
        .attr("width", this.WIDTH * this.OVERLAY_MULTIPLIER)
        .attr("height", this.HEIGHT * this.OVERLAY_MULTIPLIER)
        .attr(
          "transform",
          `translate(-${this.WIDTH * this.OVERLAY_OFFSET},-${this.HEIGHT *
            this.OVERLAY_OFFSET})`
        )
        .style("fill", "none")
        .style("pointer-events", "all");
      //handle mobile dimensions
      this.projection = d3
        .geoMercator()
        .center([25.5095, 37.5742])
        .scale(3500)
        .translate([this.WIDTH / 2, this.HEIGHT / 2]);
    },
    async fetchCasesCSV() {
      const data = await d3.csv(
        "https://dimglyn.s3.eu-central-1.amazonaws.com/preprocessed_cases.csv"
      );
      this.casesData = [...this.casesData, ...data];
    },
    async fetchGeoJSON() {
      this.geoData = await d3.json(
        "https://dimglyn.s3.eu-central-1.amazonaws.com/greece.json"
      );
    },
    prepareSVG() {
      this.path = d3.geoPath().projection(this.projection);

      this.color = d3
        .scaleQuantize()
        .range(["#1aa260", "#ffce44", "	#FF9900", "#de5246"]);
    },
    zoomHandler() {
      this.g.attr("transform", d3.event.transform);
    },
    mouseOverHandler(d, i) {
      d3.select(i).style("fill", this.HOVER_COLOR);
      d3.select("#tooltip")
        .transition()
        .duration(200)
        .style("opacity", 1);
      d3.select("#tooltip")
        .style("text-align", "left")
        .html(
          "<p><h3>" +
            d.properties.name +
            "</h3>" +
            "<h4>επιβεβαιωμένα: " +
            d.properties.lastvalue_confirmed +
            "</h4>" +
            "<h4>τελευταίες 10 μέρες: " +
            d.properties.progress +
            "</h4></p>" +
            "<h4>θάνατοι: " +
            d.properties.lastvalue_deaths +
            "</h4>" +
            "<h4>τελευταίες 10 μέρες: " +
            d.properties.progress_deaths +
            "</h4>"
        );
    },
    mouseMoveHandler() {
      return this.tooltip
        .style("top", d3.event.pageY + "px")
        .style("left", d3.event.pageX + "px");
    },
    clickHandler(d) {
      d3.select("#map__text").text(`Επιλέξατε ${d.properties.name}`);
    },
    plotMap(src) {
      const dataSource =
        src === "progress_confirmed"
          ? "progress_ten_days_confirmed"
          : src === "confirmed"
          ? "latest_value_confirmed"
          : "deaths";

      this.color.domain([
        d3.min(this.casesData, d =>
          Math.log(Number(d[dataSource]) + Number(1))
        ),
        d3.max(this.casesData, d => Math.log(Number(d[dataSource]) + Number(1)))
      ]);

      for (let i = 0; i < this.casesData.length; i++) {
        //Grab state name
        const dataState = this.casesData[i].county;
        //Grab data value, and convert from string to float
        const progressValue_confirmed = parseFloat(
          this.casesData[i]["progress_ten_days_confirmed"]
        );
        const lastValue_confirmed = parseFloat(
          this.casesData[i]["latest_value_confirmed"]
        );
        const progressValue_deaths = parseFloat(
          this.casesData[i]["progress_ten_days_deaths"]
        );
        const lastValue_deaths = parseFloat(
          this.casesData[i]["latest_value_deaths"]
        );

        //Find the corresponding state inside the GeoJSON
        for (let j = 0; j < this.geoData.features.length; j++) {
          const jsonState = this.geoData.features[j].properties.name_greek;
          if (dataState == jsonState) {
            //Copy the data value into the JSON
            this.geoData.features[
              j
            ].properties.progress = progressValue_confirmed;
            this.geoData.features[
              j
            ].properties.lastvalue_confirmed = lastValue_confirmed;
            this.geoData.features[
              j
            ].properties.progress_deaths = progressValue_deaths;
            this.geoData.features[
              j
            ].properties.lastvalue_deaths = lastValue_deaths;
            //console.log(dataState,lastValue_deaths, Math.log(lastValue_deaths+1))
            //Stop looking through the JSON
            break;
          }
        }
      }

      this.g
        .append("g")
        .selectAll("path")
        .data(this.geoData.features)
        .enter()
        .append("path")
        .attr("d", this.path)
        .style("fill", d =>
          src === "progress_confirmed"
            ? this.color(Math.log(d.properties.progress + 1))
            : src === "deaths"
            ? this.color(Math.log(d.properties.lastvalue_deaths + 1))
            : this.color(Math.log(d.properties.lastvalue_confirmed + 1))
        )
        .attr("stroke", "#FFF")
        .attr("stroke-width", 1.5)
        .on("mouseover", this.mouseOverHandler)
        .on("mouseout", (d) => {
          let value;
          if (src === "progress_confirmed") {
            value = this.color(Math.log(d.properties.progress + 1));
          } else if (src === "deaths") {
            value = this.color(Math.log(d.properties.lastvalue_deaths + 1));
          } else if (src === "confirmed") {
            value = this.color(Math.log(d.properties.lastvalue_confirmed + 1));
          }
          d3.select(this).style("fill", value);
          d3.select("#tooltip").style("opacity", 0);
        })
        .on("mousemove", this.mouseMoveHandler)
        .on("click", this.clickHandler);
    }
  },
  async mounted() {
    await this.fetchCasesCSV();
    await this.fetchGeoJSON();
    this.zoom = d3
      .zoom()
      .scaleExtent(this.ZOOM_THRESHOLD)
      .on("zoom", this.zoomHandler);
    this.init();
    this.prepareSVG();
    this.tooltip = d3
      .select("#map__container")
      .append("div")
      .attr("id", "tooltip")
      .attr("style", "opacity: 0;");

    this.plotMap("progress_confirmed");
  }
};
</script>

<style>
#map {
  height: 100%;
}
#map__container {
  position: relative;
  height: 100%;
}

#btn-zoom {
  position: absolute;
  top: 45px;
  left: 10px;
  z-index: 10;
}

.story-buttons {
  padding: 0;
  top: 0;
  left: 0;
  background-color: #ffffff;
  transition: opacity .5s;
}
#progress_confirmed:hover,
#confirmed:hover,
#deaths:hover {
  background: rgba(128, 128, 128, 0.8);
}

#progress_confirmed,
#confirmed,
#deaths {
  border-radius: 40px;
}

#map__text {
  position: absolute;
  top: 0px;
  left: 10px;
  z-index: 10;
}

#tooltip h3 {
  margin: 4px;
  font-size: 14px;
}
#tooltip h4 {
  margin: 4px;
  font-size: 10px;
}

#tooltip {
  position: absolute;
  display: block;
  text-align: center;
  width: max-content;
  max-width: 250px;
  height: max-content;
  padding: 4px;
  font: 12px sans-serif;
  border: 2px;
  border-radius: 15px;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  opacity: 0.1;
}
</style>