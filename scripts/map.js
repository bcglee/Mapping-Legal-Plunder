class Map {
    constructor (width, height) {
        this.width = width;
        this.height = height;

        // draw the map
        this.draw();
    }

    draw() {
        var initial_projection = d3.geoAlbers() // zoomed out overview of Italy
            .center([0, 42])
            .rotate([347, 0])
            .parallels([35, 45])
            .scale(2750)
            .translate([this.width / 2, this.height / 2]);

        var true_projection = d3.geoAlbers() // zoomed in on Lucca
            .center([-2, 44])
            .rotate([347.5, 0.125])
            .parallels([35, 45])
            .scale(50000)
            .translate([this.width / 2, this.height / 2]);

        // define path generators
        var initial_path = d3.geoPath()
            .projection(initial_projection);

        var true_path = d3.geoPath()
            .projection(true_projection);

        // create svg element
        var margin = {right: 50, left: 50 };
        var svg = d3.select("svg")
                    .attr("width", this.width - margin.left - margin.right)
                    .attr("height", this.height);

        var curr_transform;

        // defines the zoom function
        var zoom = d3.zoom()   //https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [this.width + margin.left + margin.right, this.height]])
            .on("zoom", this.zoomed);

        // sets dot size for plotting
        var dot_size = 2;

        // calls the zoom function
        svg.call(zoom);

        // state variable, to be changed by dropdown (future slider)
        var state = ({ year: "1333" });

        // transition duration in ms for zoom on load
        var load_transition_duration = 2500;
        // transition delay in ms for zoom on load
        var load_transition_delay = 1500;

        // http://bl.ocks.org/biovisualize/1016860
        // https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")  // from http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        // initial plottng of gray points for zoom
        d3.json("https://homes.cs.washington.edu/~akintilo/cse512/a3/italy.json").then(function (map) {
            d3.csv("../data/unique_locations.csv").then(function (data) {
                // show map
                svg.selectAll("path")
                    .data(topojson.feature(map, map.objects.custom).features)
                    .join("path")
                    .attr("fill", "#3d3d3d")
                    .attr("d", initial_path);

                // show dots
                var dots = svg.selectAll(".backdot").data(data) // selection should be empty...
                var enterdots = dots.enter()
                    .append("circle")
                    .attr("class", "backdot")
                    .attr("cx", function (d) {
                        return initial_projection([d["lon"], d["lat"]])[0];
                    })
                    .attr("cy", function (d) {
                        return initial_projection([d["lon"], d["lat"]])[1];
                    })
                    .attr("r", function(d) {
                        // return Math.log(d["ct"]+1);
                        return Math.sqrt(d["ct"]/2);
                    })
                    .attr("fill","gray")
                    .attr("fill-opacity", .75)
                    .on("mouseover", function(d){return tooltip.style("visibility", "visible")
                                                            .text(d["town"]);})
                    //.on("mouseover", function(d){return tooltip.text("TEST");})
                    .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
                    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

                // zoom in on load
                svg.selectAll("path")
                    .data(topojson.feature(map, map.objects.custom).features)
                    .join("path")
                    .transition("map_zoom") // ugly transition, ease-in-out would be better
                    .delay(load_transition_delay)
                    .duration(load_transition_duration)
                    .attr("d", true_path);

                enterdots.transition("dot_zoom")
                    .delay(load_transition_delay)
                    .duration(load_transition_duration)
                    .attr("cx", function (d) {
                        return true_projection([d["lon"], d["lat"]])[0];
                    })
                    .attr("cy", function (d) {
                        return true_projection([d["lon"], d["lat"]])[1];
                    });
            });
        });

    // adds blue background in order to make water blue
    svg.append('rect')
        .attr('width', this.width + margin.left + margin.right)
        .attr('height', this.height)
        .attr('fill', 'lightBlue');
    }

    // function for zoomin'
    zoomed() {
        var curr_transform = d3.event.transform;
        //transforms the map appropriately (with zoom)
        svg.selectAll('path')
            .attr('transform', d3.event.transform);

        //transforms the dots appropriately (with zoom)
        svg.selectAll(".backdot")
            .attr('transform', d3.event.transform);

        //transforms the dots appropriately (with zoom)
        svg.selectAll(".foredot")
            .attr('transform', d3.event.transform);
    };
}