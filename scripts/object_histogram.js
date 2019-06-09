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
            .padding(0.1);

        this.cat_yScale = d3.scaleLog()
            .domain([1, 2000])
            .range([this.height, 0]);
        this.resize();

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        this.div = d3.select("#categoryHist")
        this.svg = this.div.append("svg")
            .attr("class", "obj_hist")
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

        //need to set cat_xScale domain before plotting
        this.cat_xScale.domain(this.data.map((d) => d.object_category));

        // this.svg.selectAll(".forebar").remove();

        // append the rectangles for the bar chart
        // here, "this" refers to the current rectangle that we're editing
        this.svg.selectAll(".bar")
            .data(that.categories)
            .enter().append("rect")
            .attr("class", "bar selected")
            .attr("id", d => d["object category"])
            .attr("x", (d) => this.cat_xScale(d["object category"]) )
            .attr("width", this.cat_xScale.bandwidth())
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
            .attr("class", "x axis")
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
            .attr("class", "y axis")
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
        // boolean for determining if the clicked category is selected
        var selected = this.plunder.selected_categories[d["object category"]];

        // filters data for category with click event
        var newData = this.plunder.filter_categories(d["object category"], !selected);

        if (!selected) {
            //changes current bar
            d3.select(bar)
                .attr("class", "bar selected");
        }
        else {
            d3.select(bar)
                .attr("class", "bar deselected");
        }

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
