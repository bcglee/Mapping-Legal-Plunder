import Component from './component.js';

class ObjectHistogram extends Component {
    constructor (margin, width, height, data, map) {
        super(margin, width, height, data, map);

        // init object histogram
        this.init();
    }

    init() { // stuff we do BEFORE loading data
        // set the ranges
        this.cat_xScale = d3.scaleBand()
            .range([0, this.width])
            .padding(0.1);

        this.cat_yScale = d3.scaleLog()
            .domain([1, 2000])
            .range([this.height, 0]);

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        this.div = d3.select("#categoryContainer")
        this.svg = this.div.append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // adds title to histogram
        // http://www.d3noob.org/2013/01/adding-title-to-your-d3js-graph.html
        this.svg.append("text")
                .attr("x", (this.width / 2))
                .attr("y", 10 - (this.margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("PLUNDERED ITEM CATEGORIES");

        // text label for the x axis
        // https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
        this.svg.append("text")
                .attr("x", (this.width / 2))
                .attr("y", this.height + (2 * this.margin.bottom / 3))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Item Category");

        // text label for the y axis
        // http://jsfiddle.net/manojmcet/g47hN/
        // annoyingly subtle b/c defaults to rotating around origin (0,0)
        this.svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.margin.left)
                .attr("x", 0 - (this.height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Number of Items");

        // http://bl.ocks.org/biovisualize/1016860
        // https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
        this.tooltip = d3.select("body")
                         .append("div")
                         .attr("class", "obj_tooltip")  // from http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
                         .style("position", "absolute")
                         .style("z-index", "10")
                         .style("visibility", "hidden");
    }

    draw() { // stuff we do AFTER loading

        // we need to store the class variable as "that" beore calling the inline function for mouseover
        // if we don't do this, we'll have a problem where the mouseover will recognize "this" as the class variable
        var that = this;

        //need to set cat_xScale domain before plotting
        this.cat_xScale.domain(this.data.map((d) => d.object_category));

        //this.svg.selectAll(".forebar").remove();

        // append the rectangles for the bar chart
        // here, "this" refers to the current rectangle that we're editing
        this.svg.selectAll(".bar")
            .data(that.categories)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d) => this.cat_xScale(d["object category"]) )
            .attr("width", this.cat_xScale.bandwidth())
            .style("fill", "black")
            .style("stroke-width", 4)
            .style("stroke", "red")
            .attr("y", (d) => this.cat_yScale(this.data.filter(el => el["object_category"] === d["object category"]).length) )
            .attr("height", (d) => this.height - this.cat_yScale(this.data.filter(el => el["object_category"] === d["object category"]).length) )
            .on("click",  function(d) {
              that.onclick(d, this);
            })
            //(d, this) => that.onclick(d, this))
            .on("mouseover", function(d) {
                var total_num = that.data.filter(el => el["object_category"] === d["object category"]).length;
                var selected_num = that.plunder.apply_filters().filter(el => el["object_category"] === d["object category"]).length;
                // adds tooltip on object category when mouseover the bar, giving counts for bar
                that.tooltip.style("visibility", "visible")
                            .html("Total: " + total_num + "<br>Selected: " + selected_num);

            })
            .on("mousemove", () => this.tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px"))
            .on("mouseout", function() {
                that.tooltip.style("visibility", "hidden");
            });


        // add the x Axis
        this.svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.cat_xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .style("color", "black")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");          // https://bl.ocks.org/d3noob/0e276dc70bb9184727ee47d6dd06e915

        // add the y Axis
        this.svg.append("g")
            .call(d3.axisLeft(this.cat_yScale));

        // adds horizontal grid lines
        this.svg.append("g")
            .attr("class", "grid")
            .call(() => this.th.make_y_gridlines(this.cat_yScale)
                .tickSize(-this.width)
                .tickFormat("")
            );
    }

    onclick(d, bar){
                                    // filters data for category with click event
                                    var newData = this.plunder.filter_categories(d["object category"]);
                                    //var newData = that.data.filter(el => el["object_category"] === d["object category"]);

                                    // boolean for determining if the clicked category is selected
                                    var selected = this.plunder.selected_categories[d["object category"]];

                                    //d3.select(this)
                                    //  .style("fill", "gray");
                                    d3.selectAll('.foredot').remove();
                                    d3.selectAll('.forebar2').remove();

                                    if (selected === true) {
                                                  //changes current bar
                                                  d3.select(bar)
                                                    .style("stroke", "red");

                                    }  else{
                                      d3.select(bar)
                                        .style("stroke", "gray");
                                      };
                                                      //changes map
                                                      this.map.svg.selectAll('.foredot')
                                                          .data(newData)
                                                          .enter()
                                                          .append("circle")
                                                          .attr("class", "foredot")
                                                          .attr("cx", (d) => this.map.true_projection([d["lon"], d["lat"]])[0])
                                                          .attr("cy", (d) => this.map.true_projection([d["lon"], d["lat"]])[1])
                                                          .attr("transform", this.map.curr_transform)
                                                          .attr("r", (d) => Math.sqrt(newData.filter(el => el["town"] === d["town"]).length/2))
                                                          .style("fill", "green")
                                                          .on("mouseover", () => tooltip.style("visibility", "visible")
                                                          .text(d["town"]));

                                                      //timeline histogram
                                                      var bins = this.th.histogram(newData);

                                                      //timeline histogram
                                                      var bar = this.th.svg.selectAll(".forebar2")
                                                                           .data(bins)
                                                                           .enter()
                                                                           .append("g")
                                                                           .attr("class", "forebar2")
                                                                           .attr("transform",  (d) => "translate(" + this.th.time_xScale(d.x0) + "," + this.th.time_yScale(d.length) + ")" )

                                                      // timeline histogram
                                                      var rects = bar.append("rect")
                                                                     .attr("x", 1)
                                                                     // for width, need to make sure to not return width with negative value
                                                                     .attr("width",  (d) => this.th.time_xScale(d.x1) - this.th.time_xScale(d.x0) - 1 > 0 ? this.th.time_xScale(d.x1) - this.th.time_xScale(d.x0) - 1 : 0)
                                                                     .attr("height",  (d) => this.th.height - this.th.time_yScale(d.length))
                                                                     .style("fill","green");


                                                      // update data table
                                                      this.plunder_table.table.remove();
                                                      this.plunder_table.init();

     }

    // stuff we can't include in constructor as they become available after
    // loading data
    post_load(data, map, locations, categories, timeline_hist, plunder, plunder_table) {
        this.data = data;
        this.map = map;
        this.locations = locations;
        this.categories = categories;
        this.th = timeline_hist;
        this.plunder = plunder;
        this.plunder_table = plunder_table;
    }
}

export default ObjectHistogram;
