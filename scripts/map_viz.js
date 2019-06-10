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
        this.div = d3.select("#mapContainer")
        this.svg = this.div.append("svg")
            .attr("class", "map");
            // .attr("height", this.height);

        // now getting width and height via css
        this.width = parseInt(this.svg.style("width"), 10);
        this.height = parseInt(this.svg.style("height"), 10);

        this.initial_projection = d3.geoAlbers() // zoomed out overview of Italy
            .center([0, 42])
            .rotate([347, 0])
            .parallels([35, 45])
            .scale(2750);

        this.true_projection = d3.geoAlbers() // zoomed in on Lucca
            .center([-2, 44])
            .rotate([347.5, 0.125])
            .parallels([35, 45])
            .scale(60000);

        // define path generators
        this.initial_path = d3.geoPath()
            .projection(this.initial_projection);

        this.true_path = d3.geoPath()
            .projection(this.true_projection);

        // defines the zoom function
        this.zoom = d3.zoom()   //https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2
            .scaleExtent([1, 3])
            .translateExtent([[0, 0], [this.width, this.height]])
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
            .attr("class", "town_tooltip")  // from http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

            // http://bl.ocks.org/biovisualize/1016860
            // https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
            this.lucca_tooltip = d3.select("body")
                .append("div")
                .attr("class", "lucca_tooltip")  // from http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden");

        // adds blue background in order to make water blue
        this.svg.append('rect')
            .attr("class", "water");
        
        

        // reset zoom button
        this.button = document.createElement("button");
        this.button.className = "hidden";
        var button_text = document.createTextNode("default view");
        this.button.appendChild(button_text);
        this.button.addEventListener("click", () => this.resetzoom());
        this.div.node().appendChild(document.createElement("br"));
        this.div.node().appendChild(this.button);
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
            .on("mouseover", function(d) {
                //need to use that.th.data, that.th.plunder b/c map_viz doesn't have access to these in post_load
                var total_num = that.th.data.filter(el => el["town"] === d["town"]).length;
                var selected_num = that.th.plunder.apply_filters().filter(el => el["town"] === d["town"]).length;
                // adds tooltip on town when mouseover the bar, giving town name, as well as counts for town
                that.tooltip.style("visibility", "visible")
                            .html('Town: ' + d["town"] + "<br>Total: " + total_num + "<br>Selected: " + selected_num);

            })
            //.on("mouseover", (d) => this.tooltip.style("visibility", "visible").text(d["town"]))
            .on("mousemove", () => this.tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"))
            .on("mouseout", () => this.tooltip.style("visibility", "hidden"));

            var luccadot = this.svg.selectAll(".luccadot").data([{town: "Lucca", lon: "10.5027", lat: "43.8429", ct: "150"}]);
            var that=this
            setTimeout(function lucca_dot(){
            luccadot = luccadot.enter()
                .append("rect")
                .attr("class", "luccadot")
                .attr("x", (d) => that.true_projection([d["lon"], d["lat"]])[0])
                .attr("y", (d) => that.true_projection([d["lon"], d["lat"]])[1])
                .attr("width", 9)
                .attr("height", 9)
                .attr("fill","#FFFFFF")
                .on("mouseover", (d) => that.lucca_tooltip.style("visibility", "visible") .html(d["town"] + ' (city center)'))
                .on("mousemove", () => that.lucca_tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"))
                .on("mouseout", () => that.lucca_tooltip.style("visibility", "hidden"));
            },4000)

        // zoom in on load
        this.svg.selectAll("path")
            .data(topojson.feature(this.map, this.map.objects.custom).features)
            .join("path")
            .transition("map_zoom")
            .delay(this.load_transition_delay)
            .duration(this.load_transition_duration)
            .attr("d", this.true_path);

            var legend_box=this.svg.append("rect")
            .attr("fill", "white")
            .attr("stroke", "white")
            .attr("x", this.width-90)
            .attr("y",this.height-280)
            .attr("width", 80)
            .attr("height", 250)
            .attr("fill-opacity", 0.2)

        enterdots.transition("dot_zoom")
            .delay(this.load_transition_delay)
            .duration(this.load_transition_duration)
            .attr("cx", (d) => this.true_projection([d["lon"], d["lat"]])[0])
            .attr("cy", (d) => this.true_projection([d["lon"], d["lat"]])[1]);
            
       
        const radius = d3.scaleSqrt().domain([0, 200]).range([0, 10]);
        var legend = this.svg.append("g")
                             .attr("transform", `translate(${this.width-50},${this.height + 10})`)
                             .attr("text-anchor", "middle")
                             .style("font", "10px sans-serif")
                             .selectAll("g")
                             .data([50,100,150,200])
                             .join("g");

       
        
            

          legend.append("circle")
                .attr("fill", "#609f60")
                .attr("opacity", "0.7")
                .attr("stroke", "#609f60")
                .attr("cy", d => -1.25*d)
                .attr("class","legenddot")
                .attr("r", radius);

      legend.append("text")
            .attr("class","legendtext")
            .attr("y", d => -1.25*d + 4)
            .attr("fill","white")
            .text(d3.format(".2s"));


            // added rectangle for Lucca
            // https://stackoverflow.com/questions/43174396/how-to-draw-the-triangle-symbol/43174450
            // https://gist.github.com/mbostock/3244058
        //     var that=this;
        //     var luccadot = this.svg.selectAll(".luccadot").data([{town: "Lucca", lon: "10.5027", lat: "43.8429", ct: "150"}]); // selection should be empty...
        //     var luccadot = luccadot.enter()
        //         .append("rect")
        //         .attr("class", "luccadot")
        //         .attr("x", (d) => this.true_projection([d["lon"], d["lat"]])[0])
        //         .attr("y", (d) => this.true_projection([d["lon"], d["lat"]])[1])
        //         .attr("width", 9)
        //         .attr("height", 9)
        //         .attr("fill","#FFFFFF")
        //         .on("mouseover", function(d) {
        //             that.lucca_tooltip.style("visibility", "visible")
        //                         .html(d["town"] + ' (city center)');
        //         })
        //         .on("mousemove", () => this.lucca_tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"))
        //         .on("mouseout", () => this.lucca_tooltip.style("visibility", "hidden"));

        var that = this;
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
        this.svg.selectAll(".luccadot")
                .attr('transform', d3.event.transform);

            this.svg.selectAll(".legenddot").remove();
            this.svg.selectAll(".legendtext").remove();


            var radius = d3.scaleSqrt().domain([0, 200]).range([0, 10*d3.event.transform.k]);

            var legend = this.svg.append("g")
                .attr("transform", `translate(${this.width-50},${this.height + 10})`)
                .attr("text-anchor", "middle")
                .style("font", "10px sans-serif")
              .selectAll("g")
              .data([50,100,150,200])
              .join("g");

            legend.append("circle")
            .attr("fill", "#609f60")
            .attr("opacity", "0.7")
            .attr("stroke", "#609f60")
            .attr("cy", d => -1.25*d)
            .attr("class","legenddot")
            .attr("r", radius);

            legend.append("text")
        .attr("class","legendtext")
          .attr("y", d => -1.25*d + 4)
          .attr("fill","white")
          .text(d3.format(".2s"));

        //transforms the dots appropriately (with zoom)
        this.svg.selectAll(".foredot")
            .attr('transform', d3.event.transform);

        //transforms brush appropriately (with zoom)
        this.svg.selectAll(".brush")
            .attr('transform', d3.event.transform);

        // hide zoom button when already at default zoom
        if (Math.abs(this.curr_transform.k - d3.zoomIdentity.k > 1e-5) ||
            Math.abs(this.curr_transform.x - d3.zoomIdentity.x > 0.2) ||
            Math.abs(this.curr_transform.y - d3.zoomIdentity.y > 0.4)) {
                this.button.className = "visible";
            }
        else {
            this.button.className = "hidden";
        }
    }

    // stuff we can't include in constructor as they become available after
    // loading data
    post_load(data, map, th) {
        this.data = data;
        this.map = map;
        this.th = th;
    }

    resetzoom() {
        this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
    }

}

export default MapViz;
