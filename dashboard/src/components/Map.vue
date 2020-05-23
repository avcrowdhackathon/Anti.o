<template>
  <div id="map">
    <div class="story-buttons-container" role="group" aria-label="questions to be answered">
      <button
        id="progress_confirmed"
        type="button"
        class="btn"
        @click="sourceChange('progress_confirmed')"
      >Πρόοδος</button>
      <br>
      <button id="confirmed" type="button" class="btn" @click="sourceChange('confirmed')">Επιβεβαιωμένα</button>
      <br>
      <button id="deaths" type="button" class="btn" @click="sourceChange('deaths')">Θανάτοι</button>
    </div>
    <div id="map__container"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import config from '../../config';

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
    const HOVER_COLOR = '#C0C0C0';

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
      currentSource: null,
      dataSources: {
        'progress_confirmed': 'county_ten_days_confirmed',
        'confirmed': 'lateset_value_confirmed',
        'deaths': 'progress_ten_days_deaths',
      }
    };
  },
  methods: {
    init() {
      this.svg = d3
        .select('#map__container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%');

      this.g = this.svg.call(this.zoom).append('g');

      this.g
        .append('rect')
        .attr('width', this.WIDTH * this.OVERLAY_MULTIPLIER)
        .attr('height', this.HEIGHT * this.OVERLAY_MULTIPLIER)
        .attr(
          'transform',
          `translate(-${this.WIDTH * this.OVERLAY_OFFSET},-${this.HEIGHT *
            this.OVERLAY_OFFSET})`
        )
        .style('fill', 'none')
        .style('pointer-events', 'all');
      // handle mobile dimensions
      this.projection = d3
        .geoMercator()
        .center([25.5095, 37.5742])
        .scale(3500)
        .translate([this.WIDTH / 2, this.HEIGHT / 2]);
    },
    async fetchCasesCSV() {
      const data = await d3.csv(config.casesDataUrl);
      this.casesData = [...this.casesData, ...data];
    },
    async fetchGeoJSON() {
      this.geoData = await d3.json(config.greeceGeoJsonUrl);
    },
    prepareSVG() {
      this.path = d3.geoPath().projection(this.projection);

      this.color = d3
        .scaleQuantize()
        .range(['#1aa260', '#ffce44', '	#FF9900', '#de5246']);
    },
    zoomHandler() {
      this.g.attr('transform', d3.event.transform);
    },
    mouseOverHandler(d, i, items) {
      d3.select(items[i]).style('fill', this.HOVER_COLOR);
      d3.select('#tooltip')
        .transition()
        .duration(200)
        .style('opacity', 1);
      d3.select('#tooltip')
        .style('text-align', 'left')
        .html(
          `<p><h3>${ 
            d.properties.name 
            }</h3>` +
            `<h4>επιβεβαιωμένα: ${ 
            d.properties.lastvalue_confirmed 
            }</h4>` +
            `<h4>τελευταίες 10 μέρες: ${ 
            d.properties.progress 
            }</h4></p>` +
            `<h4>θάνατοι: ${ 
            d.properties.lastvalue_deaths 
            }</h4>` +
            `<h4>τελευταίες 10 μέρες: ${ 
            d.properties.progress_deaths 
            }</h4>`
        );
    },
    mouseMoveHandler() {
      // Workaround
      // gets coordinates based on map component instead of html.
      //  56px is the height of navbar
      // 300 px is the width of sidebar
      return this.tooltip
        .style('top', `${d3.event.pageY - 56  }px`)
        .style('left', `${d3.event.pageX - 300 }px`);
    },
    clickHandler(d) {
      d3.select('#map__text').text(`Επιλέξατε ${d.properties.name}`);
    },
    sourceChange(src) {
      this.currentSource = src;
      this.plotMap(src)
    },
    getCurrentSourceColor(d) {
      let value;
        if (this.currentSource === 'progress_confirmed') {
          value = this.color(Math.log(d.properties.progress + 1));
        } else if (this.currentSource === 'deaths') {
          value = this.color(Math.log(d.properties.lastvalue_deaths + 1));
        } else if (this.currentSource === 'confirmed') {
          value = this.color(Math.log(d.properties.lastvalue_confirmed + 1));
        }
      return value;
    },
    plotMap() {
      const dataSource = this.dataSources[this.currentSource];

      this.color.domain([
        d3.min(this.casesData, d =>
          Math.log(Number(d[dataSource]) + Number(1))
        ),
        d3.max(this.casesData, d => Math.log(Number(d[dataSource]) + Number(1)))
      ]);

      for (let i = 0; i < this.casesData.length; i++) {
        // Grab state name
        const dataState = this.casesData[i].county;
        // Grab data value, and convert from string to float
        const progressValueConfirmed = parseFloat(
          this.casesData[i].county_ten_days_confirmed
        );
        const lastValueConfirmed = parseFloat(
          this.casesData[i].lateset_value_confirmed
        );
        const progressValueDeaths = parseFloat(
          this.casesData[i].progress_ten_days_deaths
        );
        const lastValueDeaths = parseFloat(
          this.casesData[i].latest_value_deaths
        );

        // Find the corresponding state inside the GeoJSON
        for (let j = 0; j < this.geoData.features.length; j++) {
          const jsonState = this.geoData.features[j].properties.name_greek;
          if (dataState === jsonState) {
            // Copy the data value into the JSON
            this.geoData.features[j].properties.progress = progressValueConfirmed;
            this.geoData.features[j].properties.lastvalue_confirmed = lastValueConfirmed;
            this.geoData.features[j].properties.progress_deaths = progressValueDeaths;
            this.geoData.features[j].properties.lastvalue_deaths = lastValueDeaths;
            break;
          }
        }
      }

      this.g
        .append('g')
        .selectAll('path')
        .data(this.geoData.features)
        .enter()
        .append('path')
        .attr('d', this.path)
        .style('fill', this.getCurrentSourceColor)
        .attr('stroke', '#FFF')
        .attr('stroke-width', 1.5)
        .on('mouseover', this.mouseOverHandler)
        .on('mouseout', (d, i, items) => {
          const value = this.getCurrentSourceColor(d)

          d3.select(items[i]).style('fill', value);
          d3.select('#tooltip').style('opacity', 0);
        })
        .on('mousemove', this.mouseMoveHandler)
        .on('click', this.clickHandler);
    }
  },
  async mounted() {
    await this.fetchCasesCSV();
    await this.fetchGeoJSON();
    this.zoom = d3
      .zoom()
      .scaleExtent(this.ZOOM_THRESHOLD)
      .on('zoom', this.zoomHandler);
    this.init();
    this.prepareSVG();
    this.tooltip = d3
      .select('#map__container')
      .append('div')
      .attr('id', 'tooltip')
      .attr('style', 'opacity: 0;');

    this.sourceChange('progress_confirmed');
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

.story-buttons-container {
  padding: 0;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  background-color: #ffffff;
  transition: opacity .5s;
  margin: 1%;
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

/* @media screen and (max-width: 600px) {
  .story-buttons-container {
    padding: 0;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1;
    background-color: #ffffff;
    transition: opacity .5s;
    margin: 1%;
  }
} */

</style>