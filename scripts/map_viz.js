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
        this.zoom = d3.zoom()   //https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [this.width + this.margin.left + this.margin.right, this.height]])
            .on("zoom", () => this.zoomed());

        // calls the zoom function
        this.svg.call(this.zoom);

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

        // // set up reset zoom button
        // var reset_zoom_button = document.getElementById('reset');
        // reset_zoom_button.onclick = this.resetzoom;
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
        var dots = this.svg.selectAll(".backdot").data(this.data); // selection should be empty...
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
            .attr("cy", (d) => this.true_projection([d["lon"], d["lat"]])[1]);

        var that = this;
        //https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a
        var brush = d3.brush()
            .extent([[0, 0], [this.width+ this.margin.left + this.margin.right, this.height]])
            // .on("start brush end ", () => this.brushmoved());
            // .on("start brush end ", this.brushmoved);
            .on("start brush end ", function() {
                    var selection = d3.event.selection;
                    if (selection === null) {
                        //that.handle.attr("display", "none");
                        //circle.classed("active", false);
                    } 
                    else {
                        var e = d3.brushSelection(this);

                        var newLocations = that.oh.locations.filter( (d) => {
                            var cx=that.true_projection([d["lon"], d["lat"]])[0]
                            var cy=that.true_projection([d["lon"], d["lat"]])[1]
                            return e[0][0] <= cx && e[1][0] >= cx && e[0][1] <= cy && e[1][1] >= cy; });
                        d3.selectAll('.foredot').remove(); // remove old foredots

                        that.svg.selectAll('.foredot')
                            .data(that.oh.locations)
                            .enter()
                            .append("circle")
                            .attr("class", "foredot")
                            .attr("cx",  (d) => {
                                return that.true_projection([d["lon"], d["lat"]])[0];
                            })
                            .attr("cy",  (d) => {
                                return that.true_projection([d["lon"], d["lat"]])[1];
                            })
                            .attr("transform", that.curr_transform)
                            .attr("r", (d) => {
                                // need to check if the current location is within the filtered locations
                                // if so, return the count at the location
                                if (newLocations.map(a => a.town).includes(d.town) === true) {return Math.sqrt(d["ct"]/2)}
                            })
                            .style("fill", "green")
                            .on("mouseover", (d) => that.tooltip.style("visibility", "visible")
                                .text(d["town"]))
                            .on("mousemove", () => that.tooltip.style("top", (event.pageY-10)+"px")
                                .style("left",(event.pageX+10)+"px"))
                            .on("mouseout", () => that.tooltip.style("visibility", "hidden"));


                        var newData = that.oh.data.filter( (d) => {
                            var cx=that.true_projection([d["lon"], d["lat"]])[0]
                            var cy=that.true_projection([d["lon"], d["lat"]])[1]
                            //console.log(e)
                            return e[0][0] <= cx && e[1][0] >= cx && e[0][1] <= cy && e[1][1] >= cy;
                       });

                        d3.selectAll('.forebar2').remove();
                        var bins = that.th.histogram(newData);

                        var bar = that.th.svg.selectAll(".forebar2")
                            .data(bins)
                            .enter().append("g")
                            .attr("class", "forebar2")
                            .attr("transform",  (d) => "translate(" + that.th.time_xScale(d.x0) + "," + that.th.time_yScale(d.length) + ")");


                        var rects = bar.append("rect")
                            .attr("x", 1)
                            // for height, need to make sure not to return negative width
                            .attr("width",  (d) => that.th.time_xScale(d.x1) - that.th.time_xScale(d.x0) - 1 > 0 ? that.th.time_xScale(d.x1) - that.th.time_xScale(d.x0) - 1 : 0)
                            .attr("height",  (d) => that.th.height - that.th.time_yScale(d.length))
                            .style("fill","green");

                        d3.selectAll('.forebar').remove();
                        that.oh.svg.selectAll(".forebar")
                            .data(newData)
                            .enter().append("rect")
                            .attr("class", "forebar")
                            .attr("x", (d) => that.oh.cat_xScale(d.object_category))
                            .attr("width", that.oh.cat_xScale.bandwidth())
                            .style("fill", "green")
                            .attr("y", (d) => that.oh.cat_yScale(newData.filter(el => el["object_category"] === d["object_category"]).length))
                            .attr("height", (d) => that.oh.height -that.oh.cat_yScale(newData.filter(el => el["object_category"] === d["object_category"]).length));
                    }

            });
        var gBrush = this.svg.append("g")
            .attr("class", "brush")
            .call(brush);
        var brushResizePath =  (d) => {
            var e = +(d.type === "e"),
                x = e ? 1 : -1,
                y = this.th.height / 2;
            return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
        };

        gBrush.data([{ type: "w" }, { type: "e" }])
            .enter().append("path")
            .attr("cursor", "ew-resize")
            .attr("d", brushResizePath);

        gBrush.call(brush.move, [0.3, 0.5].map(this.th.time_xScale));

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

        //transforms brush appropriately (with zoom)
        this.svg.selectAll(".brush")
            .attr('transform', d3.event.transform);
    }

    // stuff we can't include in constructor as they become available after
    // loading data
    post_load(data, map, timeline_hist, object_hist) {
        this.data = data;
        this.map = map;
        this.th = timeline_hist;
        this.oh = object_hist;
    }

    resetzoom() {
        this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
    }

}

export default MapViz;
