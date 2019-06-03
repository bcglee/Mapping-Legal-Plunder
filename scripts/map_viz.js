import Component from './component.js';

class MapViz extends Component {
    constructor (margin, width, height) {
        super(margin, width, height);
        this.curr_transform;

        // init map
        this.init();
    }

    init() {
        // create svg element
        this.svg = d3.select("svg")
                    .attr("width", this.width - this.margin.left - this.margin.right)
                    .attr("height", this.height);

        this.initial_projection = d3.geoAlbers() // zoomed out overview of Italy
            .center([0, 42])
            .rotate([347, 0])
            .parallels([35, 45])
            .scale(2750)
            .translate([this.width / 2, this.height / 2]);

        this.true_projection = d3.geoAlbers() // zoomed in on Lucca
            .center([-2, 44])
            .rotate([347.5, 0.125])
            .parallels([35, 45])
            .scale(50000)
            .translate([this.width / 2, this.height / 2]);

        // define path generators
        this.initial_path = d3.geoPath()
            .projection(this.initial_projection);

        this.true_path = d3.geoPath()
            .projection(this.true_projection);

        // defines the zoom function
        var zoom = d3.zoom()   //https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [this.width + this.margin.left + this.margin.right, this.height]])
            .on("zoom", () => this.zoomed());

        // calls the zoom function
        this.svg.call(zoom);

        // transition duration in ms for zoom on load
        this.load_transition_duration = 2500;
        // transition delay in ms for zoom on load
        this.load_transition_delay = 1500;

        // http://bl.ocks.org/biovisualize/1016860
        // https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")  // from http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        // adds blue background in order to make water blue
        this.svg.append('rect')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height)
            .attr('fill', 'lightBlue');
    }

    draw() {
        // initial plottng of gray points for zoom
        // show map
        this.svg.selectAll("path")
            .data(topojson.feature(this.map, this.map.objects.custom).features)
            .join("path")
            .attr("fill", "#3d3d3d")
            .attr("d", this.initial_path);

        // show dots
        var dots = this.svg.selectAll(".backdot").data(this.data) // selection should be empty...
        var enterdots = dots.enter()
            .append("circle")
            .attr("class", "backdot")
            .attr("cx", (d) => this.initial_projection([d["lon"], d["lat"]])[0])
            .attr("cy", (d) => this.initial_projection([d["lon"], d["lat"]])[1])
            .attr("r", function(d) {
                return Math.sqrt(d["ct"]/2);
            })
            .attr("fill","gray")
            .attr("fill-opacity", .75)
            .on("mouseover", (d) => this.tooltip.style("visibility", "visible").text(d["town"]))
            .on("mousemove", () => this.tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"))
            .on("mouseout", () => this.tooltip.style("visibility", "hidden"));

        // zoom in on load
        this.svg.selectAll("path")
            .data(topojson.feature(this.map, this.map.objects.custom).features)
            .join("path")
            .transition("map_zoom")
            .delay(this.load_transition_delay)
            .duration(this.load_transition_duration)
            .attr("d", this.true_path);

        enterdots.transition("dot_zoom")
            .delay(this.load_transition_delay)
            .duration(this.load_transition_duration)
            .attr("cx", (d) => this.true_projection([d["lon"], d["lat"]])[0])
            .attr("cy", (d) => this.true_projection([d["lon"], d["lat"]])[1])
    }

    // function for zoomin'
    zoomed() {
        this.curr_transform = d3.event.transform;
        //transforms the map appropriately (with zoom)
        this.svg.selectAll('path')
            .attr('transform', d3.event.transform);

        //transforms the dots appropriately (with zoom)
        this.svg.selectAll(".backdot")
            .attr('transform', d3.event.transform);

        //transforms the dots appropriately (with zoom)
        this.svg.selectAll(".foredot")
            .attr('transform', d3.event.transform);
    }
}

export default MapViz;