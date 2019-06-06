// don't forget to use triple equals!
import MapViz from './map_viz.js';
import TimelineHistogram from './timeline_histogram.js'
import ObjectHistogram from './object_histogram.js';
import DataProcessor from './data_processor.js';
import TownSelector from './town_selector.js';

// initialize map visualization
var map_margin = { right: 50, left: 50 },
    map_width = 1000,
    map_height = 400;
const map_viz = new MapViz(map_margin, map_width, map_height);

// initialize timeline histogram
var th_margin = { top: 30, right: 30, bottom: 30, left: 55 },
    th_width = 1000 - th_margin.left - th_margin.right,
    th_height = 250 - th_margin.top - th_margin.bottom;
const th = new TimelineHistogram(th_margin, th_width, th_height);

// initialize object histogram
var oh_margin = { top: 20, right: 20, bottom: 100, left: 65 },
    oh_width = 1000 - oh_margin.left - oh_margin.right,
    oh_height = 300 - oh_margin.top - oh_margin.bottom;
const oh = new ObjectHistogram(oh_margin, oh_width, oh_height);

// radio buttons
function update_enabled() {
    enabled = document.querySelector('input[name= "interactivity"]:checked').value;
    if (enabled === 'int1') {
        map_viz.enable_interactivity();
        th.disable_interactivity();
        oh.disable_interactivity();
    }
    else if (enabled === 'int2') {
        map_viz.disable_interactivity();
        th.enable_interactivity();
        oh.disable_interactivity();
    }
    else if (enabled === 'int3') {
        map_viz.disable_interactivity();
        th.disable_interactivity();
        oh.enable_interactivity();
    }
}
var enabled;
var int1 = document.getElementById('int1');
var int2 = document.getElementById('int2');
var int3 = document.getElementById('int3');
int1.onclick = update_enabled;
int2.onclick = update_enabled;
int3.onclick = update_enabled;
update_enabled();

// reset zoom
var reset_zoom_button = document.getElementById('reset');
reset_zoom_button.onclick = () => map_viz.resetzoom();

// apply date format func to date value of each row of data
// necessary for data read of lucca_debt_full_dates_cleaned.csv
var parseDate = d3.isoParse,
    formatCount = d3.format(",.0f");
function type(d) {
    d.date_full = parseDate(d.date_full);
    return d;
}

// show map
d3.json("https://homes.cs.washington.edu/~akintilo/cse512/a3/italy.json").then(function (map) {
    d3.csv("../data/unique_locations.csv", d3.autoType).then(function (data) {
        map_viz.post_load(data, map, th, oh);
        map_viz.draw();
    });
});

// show histograms
d3.csv("data/DALME_datasets/lucca_debt_full_dates_cleaned.csv", type).then(function (data) {
    d3.csv("data/unique_locations.csv").then(function (locations) {
        d3.csv("data/DALME_datasets/unique_categories.csv").then(function (categories) {
            // TESTING DataProcessor: uncomment/edit below to test
            // DataProcessor
            const plunder = new DataProcessor(data, locations, categories);
            console.log(plunder.apply_filters());
            // console.log("Going down...")
            // plunder.filter_towns("Pisa");
            // plunder.filter_towns("Pieve di Calci");
            // console.log(plunder.filter_towns("Fucecchio"));
            // plunder.filter_categories("foodstuffs");
            // console.log(plunder.filter_categories("tools and implements"));
            // console.log(plunder.filter_time(new Date(1333, 1, 1), new Date(1336, 1, 1)));
            // console.log("Going up...")
            // plunder.filter_towns("Pisa");
            // console.log(plunder.filter_time());
            // console.log(plunder.filter_categories());
            // console.log(plunder.filter_towns());

            th.post_load(data, map_viz, locations, categories, oh);
            oh.post_load(data, map_viz, locations, categories, th);
            th.draw();
            oh.draw();
        });

        const ts = new TownSelector(locations);
    });
});
