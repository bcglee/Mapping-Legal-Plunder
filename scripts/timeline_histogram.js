import Component from './component.js';

class TimelineHistogram extends Component {
    constructor (margin, width, height) {
        super(margin, width, height);

        // draw timeline histogram
        this.init();
    }

    init() { // stuff we do BEFORE loading data
        this.div = d3.select("#timelineContainer")
        this.svg = this.div.append("svg")
            .attr("class", "time_hist")
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // ---- date data scale-map to px --------------------------
        //   1. assign xScale a scaleTime func
        this.time_xScale = d3.scaleTime()
            //   2. set input or date range
            .domain([new Date(1332, 10, 1), new Date(1343, 2, 1)])
            //   3. set output or px range
            .rangeRound([0, this.width]);

        var time_xTickNum = 20;

        this.time_yScale = d3.scaleLinear()
            .range([this.height, 0]);

        this.resize();

        this.histogram = d3.histogram()
            // histogram func only use date value from each row of dataset
            // .value() is like a row function to d3.histogram()
            // as .row() to d3.tsv()
            .value(function (d) { return d.date_full; })
            .domain(this.time_xScale.domain())
            .thresholds(this.time_xScale.ticks(d3.timeMonth)); //note error with xScale(x1) in rect!!

        //from this:  https://stackoverflow.com/questions/40173533/customize-the-d3-month-or-year-tick-format
        var time_xAxis = d3.axisBottom(this.time_xScale)
            .tickFormat("")
            .ticks(time_xTickNum);

        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(time_xAxis)
            .selectAll(".tick text")
            .style("text-anchor", "start")
            .attr("x", 6)
            .attr("y", 6);

        // https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
        this.svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + this.height + ")")
            .call(
                this.make_x_gridlines(this.time_xScale, time_xTickNum)
                .tickSize(-this.height)
                .tickFormat(d3.timeFormat("%Y"))
            )
            .selectAll("text")
            .attr("dy", "1.25em");

        var time_yAxis = d3.axisLeft(this.time_yScale);

        // sets yScale
        this.time_yScale.domain([0, 300]);

        // adds axis to this.svg
        this.svg.append("g")
            .call(time_yAxis);

        // add the Y gridlines
        this.svg.append("g")
            .attr("class", "grid")
            .call(
                this.make_y_gridlines(this.time_yScale)
                    .tickSize(-this.width)
                    .tickFormat("")
                  );

        // adds title to timeline
        // http://www.d3noob.org/2013/01/adding-title-to-your-d3js-graph.html
        this.svg.append("text")
            .attr("x", (this.width / 2))
            .attr("y", 10 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("TIMELINE OF PLUNDER");

        // text label for the x axis
        // https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
        this.svg.append("text")
            .attr("x", (this.width / 2))
            .attr("y", this.height + (this.margin.bottom))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Date");

        // text label for the y axis
        // http://jsfiddle.net/manojmcet/g47hN/
        // annoyingly subtle b/c defaults to rotating around origin (0,0)
        this.svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.margin.left)
                .attr("x", 0 - (this.height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Number of Objects");

        d3.select(window).on('resize', () => this.resize());
    }

    draw() { // stuff we do AFTER loading data
        // ---- apply data to histogram func -------------
        // meaning: regroup all data into different bins
        var bins = this.histogram(this.data);

        var bar = this.svg.selectAll(".bar")
            .data(bins)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", (d) => "translate(" + this.time_xScale(d.x0) + "," + this.time_yScale(d.length) + ")");

        var rects = bar.append("rect")
            .attr("x", 1)
            // ensure that the width is >= 0
            .attr("width",  (d) => this.time_xScale(d.x1) - this.time_xScale(d.x0) - 1 > 0 ? this.time_xScale(d.x1) - this.time_xScale(d.x0) - 1 : 0)
            .attr("height", (d) => this.height - this.time_yScale(d.length));

        //https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a
        var brush = d3.brushX()
            .extent([[0, 0], [this.width, this.height]])
            .on("start brush end", () => this.brushmoved());

        var gBrush = this.svg.append("g")
            .attr("class", "brush")
            .call(brush);

        var brushResizePath = (d) => {
            var e = +(d.type === "e"),
                x = e ? 1 : -1,
                y = this.height / 2;
            return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
        }

        this.handle = gBrush.selectAll(".handle--custom")
            .data([{ type: "w" }, { type: "e" }])
            .enter().append("path")
            .attr("class", "handle--custom")
            .attr("stroke", "#000")
            .attr("cursor", "ew-resize")
            .attr("d", brushResizePath);

        gBrush.call(brush.move, [0.3, 0.5].map(this.time_xScale));

        // //need to set cat_xScale domain before plotting
        // this.oh.cat_xScale.domain(this.data.map((d) => d.object_category));

        // this.oh.svg.selectAll(".forebar")
        //     .data(this.categories)
        //     .enter().append("rect")
        //     .attr("class", "forebar")
        //     .attr("x", (d) => this.oh.cat_xScale(d["object category"]) )
        //     .attr("width", this.oh.cat_xScale.bandwidth())
        //     .attr("y", (d) => {
        //         const count = newData.filter(el => el["object_category"] === d["object category"]).length;
        //         //logscale need to handle case of empty selection when brushing
        //         return count !== 0 ? this.oh.cat_yScale(count) : 0;
        //     })
        //     .attr("height", (d) => {
        //         const count = newData.filter(el => el["object_category"] === d["object category"]).length;
        //         //logscale need to handle case of empty selection when brushing
        //         return count !== 0 ? this.oh.height - this.oh.cat_yScale(count) : 0;
        //     });
    }

    resize() {
        this.width = parseInt(d3.select("#timelineContainer").style("width"), 10);
        this.width = this.width - this.margin.left - this.margin.right;
        this.height = parseInt(d3.select("#timelineContainer").style("height"), 10);
        this.height = this.height - this.margin.top - this.margin.bottom;

        this.time_xScale.rangeRound([0, this.width]);
        this.time_yScale.range([this.height, 0]);
    }

    // stuff we can't include in constructor as they become available after
    // loading data
    post_load(data, map, locations, categories, obj_hist, plunder, plunder_table) {
        this.data = data;
        this.map = map;
        this.locations = locations;
        this.categories = categories;
        this.oh = obj_hist;
        this.plunder = plunder;
        this.plunder_table = plunder_table;
    }

    brushmoved() {

        var selection = d3.event.selection;

        //use this formatTime to print selected dates on plot
        var formatTime = d3.timeFormat("%b, %Y");

        if (selection === null) {
            this.handle.attr("display", "none");
            var newData = this.plunder.filter_time(new Date(1332, 10, 1), new Date(1343, 2, 1));

              //adds text of full date range on top-left of plot
              d3.selectAll('.datetext').remove();
              this.svg.append("text")
                  .attr("class", "datetext")
                  .attr("x", (this.margin.left + 10))  //107
                  .attr("y", 10 - (this.margin.top / 2))
                  .attr("text-anchor", "middle")
                  .style("font-size", "12px")
                  .html(formatTime(new Date(1332, 10, 1)) + " - " + formatTime(new Date(1343, 2, 1)));
        }
        else {
            // gets date range selected by brush
            var e = d3.event.selection.map(this.time_xScale.invert, this.time_xScale);
            var newData = this.plunder.filter_time(e[0], e[1]);
            this.handle.attr("display", null).attr("transform", (d, i) => "translate(" + [selection[i], - this.height / 4] + ")");

            //adds text of selected date range on top-left of plot
            d3.selectAll('.datetext').remove();
            this.svg.append("text")
                .attr("class", "datetext")
                .attr("x", (this.margin.left + 10))  //107
                .attr("y", 10 - (this.margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .html(formatTime(e[0]) + " - " + formatTime(e[1]));
          }

          // //d3.selectAll('.datetext').remove();
          // this.svg.append("text")
          //     .attr("class", "datetext")
          //     .attr("x", (this.margin.left))
          //     .attr("y", 10 - (this.margin.top / 2))
          //     .attr("text-anchor", "middle")
          //     .style("font-size", "12px")
          //     .html("Selected date range: ");

        this.update_all(newData);
    }

    // updates all views
    update_all(newData) {
        // timeline histogram
        d3.selectAll('.forebar2').remove();

        // handles the coloring of the bars
        var bins = this.histogram(newData);

        var bar = this.svg.selectAll(".forebar2")
            .data(bins)
            .enter()
            .append("g")
            .attr("class", "forebar2")
            .attr("transform",  (d) => "translate(" + this.time_xScale(d.x0) + "," + this.time_yScale(d.length) + ")" )

        var rects = bar.append("rect")
            .attr("x", 1)
            .attr("class", "timeline selected")
            // for width, need to make sure to not return width with negative value
            .attr("width",  (d) => this.time_xScale(d.x1) - this.time_xScale(d.x0) - 1 > 0 ? this.time_xScale(d.x1) - this.time_xScale(d.x0) - 1 : 0)
            .attr("height",  (d) => this.height - this.time_yScale(d.length));

        //need to set cat_xScale domain before plotting
        this.oh.cat_xScale.domain(this.data.map((d) => d.object_category));

        // map
        d3.selectAll('.foredot').remove(); // remove old foredots
        this.map.svg.selectAll('.foredot')
            .data(this.locations)
            .enter()
            .append("circle")
            .attr("class", "foredot")
            .attr("opacity", "0.7")
            .attr("cx", (d) => this.map.true_projection([d["lon"], d["lat"]])[0])
            .attr("cy", (d) => this.map.true_projection([d["lon"], d["lat"]])[1])
            .attr("transform", () => this.map.curr_transform)
            .attr("r", (d) => Math.sqrt(newData.filter(el => el["town"] === d["town"]).length/2))
            .on("mouseover", (d) => this.map.tooltip.style("visibility", "visible")
                .text(d["town"]))
            .on("mousemove", () => this.map.tooltip.style("top", (event.pageY-10)+"px")
                .style("left",(event.pageX+10)+"px"))
            .on("mouseout", () => this.map.tooltip.style("visibility", "hidden"));

        // object histogram
        this.oh.svg.selectAll('.forebar').remove();

        // update forebars
        this.oh.svg.selectAll(".forebar")
            .data(this.categories)
            .enter().append("rect")
            .attr("class", (d) => {
                const count = newData.filter(el => el["object_category"] === d["object category"]).length;
                return count !== 0 ? "forebar selected" : "forebar deselected";})
            .attr("id", d => d["object category"])
            .attr("x", (d) => this.oh.cat_xScale(d["object category"]))
            .attr("width", this.oh.cat_xScale.bandwidth())
            .attr("y", (d) => {
                const count = newData.filter(el => el["object_category"] === d["object category"]).length;
                //logscale need to handle case of empty selection when
                //brushing
                return count === 0 ? 0 : this.oh.cat_yScale(count) - 2;
            })
            .attr("height", 2);
        
        // update allbars
        this.oh.svg.selectAll(".allbar")
            .attr("class", (d) => {
                const selected = this.plunder.selected_categories[d["object category"]];
                return selected ? "allbar selected" : "allbar deselected";});
        
        // update clickbars
        this.oh.svg.selectAll(".clickbar")
            .attr("class", (d) => {
                const selected = this.plunder.selected_categories[d["object category"]];
                return selected ? "clickbar selected" : "clickbar deselected";});
        
        // update backbars
        this.oh.svg.selectAll(".backbar")
            .attr("class", (d) => {
                const selected = this.plunder.selected_categories[d["object category"]];
                return selected ? "backbar selected" : "backbar deselected";});
                
        // update ticks
        this.oh.svg.selectAll(".xTick")
            .attr("class", (d) => {
                const selected = this.plunder.selected_categories[d];
                return selected ? "tick xTick selected" : "tick xTick deselected";});
    }

    // gridlines in x axis function https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
    make_x_gridlines(scale, tickNum) {
        return d3.axisBottom(scale)
            .ticks(tickNum);
    }

    // gridlines in y axis function https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
    make_y_gridlines(scale) {
        return d3.axisLeft(scale)
            .ticks(10);
    }
}

export default TimelineHistogram;
