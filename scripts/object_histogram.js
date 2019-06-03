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
        this.cat_yScale = d3.scaleLinear()
                            .range([this.height, 0]);

        // append the svg object to the body of the page
        // append a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        this.svg = d3.select("body").append("svg")
                     .attr("width", this.width + this.margin.left + this.margin.right)
                     .attr("height", this.height + this.margin.top + this.margin.bottom)
                     .append("g")
                     .attr("transform",
                     "translate(" + this.margin.left + "," + this.margin.top + ")");

        // adds title to timeline
        // http://www.d3noob.org/2013/01/adding-title-to-your-d3js-graph.html
        this.svg.append("text")
                .attr("x", (this.width / 2))
                .attr("y", 10 - (this.margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("PLUNDERED ITEM CATEGORIES");
    }

    draw() { // stuff we do AFTER loading
        // Scale the range of the data in the domains
        this.cat_xScale.domain(this.data.map((d) => d.object_category));
        this.cat_yScale.domain([0, 2000]);

        // append the rectangles for the bar chart
        this.svg.selectAll(".bar")
                .data(this.data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", (d) => this.cat_xScale(d.object_category))
                .attr("width", this.cat_xScale.bandwidth())
                .attr("y", (d) => this.cat_yScale(this.data.filter(el => el["object_category"] === d["object_category"]).length))
                .attr("height", (d) => this.height -this.cat_yScale(this.data.filter(el => el["object_category"] === d["object_category"]).length));

        // add the x Axis
        this.svg.append("g")
                .attr("transform", "translate(0," + this.height + ")")
                .call(d3.axisBottom(this.cat_xScale));

        // add the y Axis
        this.svg.append("g")
                .call(d3.axisLeft(this.cat_yScale));

        // rotates x-axis labels
        // https://bl.ocks.org/d3noob/0e276dc70bb9184727ee47d6dd06e915
        this.svg.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");
    }
}

export default ObjectHistogram;