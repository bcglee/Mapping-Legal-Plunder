import Component from './component.js';

class ObjectHistogram extends Component {
    constructor (margin, width, height) {
        super(margin, width, height);

        // init object histogram
        this.init();
    }

    init() { // stuff we do BEFORE loading data
        // set the ranges
        this.cat_xScale = d3.scaleBand()
            .range([0, this.width])
            .paddingOuter(0.05)
            .paddingInner(0.1);

        this.click_xScale = d3.scaleBand()
            .range([0, this.width])
            .padding(0.0);

        this.cat_yScale = d3.scaleLog()
            .clamp(true) // forces data to fit in log scale (handles zero)
            // .domain([1, 2000]);
            // .range([this.height, 0]);

            .base(2)
            .domain([1, 2048]);

        this.resize();

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        this.div = d3.select("#categoryHist")
        this.svg = this.div.append("svg")
            .attr("class", "obj_hist")
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // text label for the x axis
        // https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
        this.svg.append("text")
                .attr("class", "axisLabel")
                .attr("x", (this.width / 2))
                .attr("y", this.height + (2 * this.margin.bottom / 3))
                .attr("text-anchor", "middle")
                .text("Object Category");

        // text label for the y axis
        // http://jsfiddle.net/manojmcet/g47hN/
        // annoyingly subtle b/c defaults to rotating around origin (0,0)
        this.svg.append("text")
                .attr("class", "axisLabel")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.margin.left)
                .attr("x", 0 - (this.height / 2))
                .attr("dy", "1.5em")
                .style("text-anchor", "middle")
                .text("# of Objects");

        // http://bl.ocks.org/biovisualize/1016860
        // https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
        this.tooltip = d3.select("body")
                         .append("div")
                         .attr("class", "obj_tooltip")  // from http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
                         .style("position", "absolute")
                         .style("z-index", "10")
                         .style("visibility", "hidden");

        // buttons
        var buttons_div = document.querySelector("#categoryButtons");

        var deselect_all = document.createElement("button");
        var deselect_all_text = document.createTextNode("deselect all");
        deselect_all.appendChild(deselect_all_text);
        deselect_all.addEventListener("click", () => this.deselect_all());
        buttons_div.appendChild(deselect_all);
        
        var select_all = document.createElement("button");
        var select_all_text = document.createTextNode("select all");
        select_all.appendChild(select_all_text);
        select_all.addEventListener("click", () => this.select_all());
        buttons_div.appendChild(select_all);
    }

    draw() { // stuff we do AFTER loading

        // we need to store the class variable as "that" beore calling the inline function for mouseover
        // if we don't do this, we'll have a problem where the mouseover will recognize "this" as the class variable
        var that = this;

        //need to set xScale domains before plotting
        this.cat_xScale.domain(this.data.map((d) => d.object_category));
        this.click_xScale.domain(this.data.map((d) => d.object_category));

        // background bar used for deselect effect
        this.svg.selectAll(".backbar")
            .data(that.categories)
            .enter().append("rect")
            .attr("class", "backbar selected")
            .attr("id", d => d["object category"])
            .attr("x", (d) => this.click_xScale(d["object category"]) )
            .attr("width", this.click_xScale.bandwidth())
            .attr("y", 0)
            .attr("height", this.height);

        // bars user can click (invisible except when deselected)
        this.svg.selectAll(".clickbar")
            .data(that.categories)
            .enter().append("rect")
            .attr("class", "clickbar selected")
            .attr("id", d => d["object category"])
            .attr("x", (d) => this.click_xScale(d["object category"]) )
            .attr("width", this.click_xScale.bandwidth())
            .attr("y", 0)
            .attr("height", this.height)
            .on("click",  function(d) {
              that.onclick(d);
              var total_num = that.data.filter(el => el["object_category"] === d["object category"]).length;
              var selected_num = that.plunder.apply_filters().filter(el => el["object_category"] === d["object category"]).length;
                // adds tooltip on object category when mouseover the bar, giving counts for bar
                that.tooltip.style("visibility", "visible")
                            .html("Total: " + total_num + "<br>Selected: " + selected_num);
            })
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

        // append the rectangles for the bar chart
        // here, "this" refers to the current rectangle that we're editing
        this.svg.selectAll(".allbar")
            .data(that.categories)
            .enter().append("rect")
            .attr("class", "allbar selected")
            .attr("id", d => d["object category"])
            .attr("x", (d) => this.cat_xScale(d["object category"]) )
            .attr("width", this.cat_xScale.bandwidth())
            .attr("y", (d) => this.cat_yScale(this.data.filter(el => el["object_category"] === d["object category"]).length) - 2)
            .attr("height", 2);

        // add the x Axis
        this.svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.cat_xScale))
            .selectAll(".tick text")
            .call(this.wrap, this.cat_xScale.bandwidth())
            .style("text-anchor", "end")
            .style("color", "black")
            .attr("transform", "rotate(-45)");          // https://bl.ocks.org/d3noob/0e276dc70bb9184727ee47d6dd06e915
            

        // update x axis tick class so we can change it when category
        // deselected
        this.svg.select(".xAxis")
            .selectAll("g")
            .attr("opacity", null)
            .attr("class", "tick xTick selected");

        const yAxis = d3.axisLeft(this.cat_yScale)
            .ticks(10, d3.format(",d"));

        // add the y Axis
        this.svg.append("g")
            .attr("class", "y axis")
            // .call(d3.axisLeft(this.cat_yScale));
            .call(yAxis)
            // .selectAll(".domain").remove();

        // adds horizontal grid lines
        this.svg.append("g")
            .attr("class", "grid")
            .call(this.th.make_y_gridlines(this.cat_yScale, 10)
                .tickSize(-this.width)
                .tickFormat("")
            );
    }

    wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 0.8, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
            while (word = words.pop()) {
                line.push(word)
                tspan.text(line.join(" "))
                if (tspan.node().getComputedTextLength() > width && tspan.text().includes(" ")) {
                    line.pop()
                    tspan.text(line.join(" "))
                    line = [word]
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
                }
            }
        })
    }

    onclick(d){
        // boolean for determining if the clicked category is selected
        var selected = this.plunder.selected_categories[d["object category"]];

        // filters data for category with click event
        var newData = this.plunder.filter_categories(d["object category"], !selected);

        this.th.update_all(newData);

     }


    // stuff we can't include in constructor as they become available after
    // loading data
    post_load(data, locations, categories, timeline_hist, plunder) {
        this.data = data;
        this.locations = locations;
        this.categories = categories;
        this.th = timeline_hist;
        this.plunder = plunder;
    }

    resize() {
        this.width = parseInt(d3.select("#categoryHist").style("width"), 10);
        this.width = this.width - this.margin.left - this.margin.right;
        this.height = parseInt(d3.select("#categoryHist").style("height"), 10);
        this.height = this.height - this.margin.top - this.margin.bottom;

        this.cat_xScale.range([0, this.width]);
        this.click_xScale.range([0, this.width]);
        this.cat_yScale.range([this.height, 0]);
    }

    select_all() {
        for (var i = 0; i < this.categories.length; i++) {
            this.plunder.filter_categories(this.categories[i]["object category"], true, true);
        }
        var newData = this.plunder.apply_filters();
        this.th.update_all(newData);
    }

    deselect_all() {
        for (var i = 0; i < this.categories.length; i++) {
            this.plunder.filter_categories(this.categories[i]["object category"], false, true);
        }
        var newData = this.plunder.apply_filters();
        this.th.update_all(newData);
    }
}

export default ObjectHistogram;
