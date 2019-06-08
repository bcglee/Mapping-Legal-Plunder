class TownSelector {
    constructor (locations, plunder, th) {
        this.locations = locations.map(d => d.town);
        this.plunder = plunder;
        this.th = th;
        this.checkboxes = [];
        this.init();
    }

    init() {
        var cbox;
        var label;
        var id;
        var selector_div = document.querySelector("#townSelector");
        for (var i=0; i < this.locations.length; i++) {
            id = "town" + i;

            cbox = document.createElement("input");
            cbox.setAttribute("type", "checkbox");
            cbox.setAttribute("id", id);
            cbox.setAttribute("name", "townSelector");
            cbox.setAttribute("checked", "checked");
            cbox.onclick = () => this.filter();

            label = document.createElement("label");
            label.setAttribute("for", id);
            label.appendChild(document.createTextNode(this.locations[i]));
            
            selector_div.appendChild(cbox);
            selector_div.appendChild(label);
            // selector_div.appendChild(document.createElement("br"));
            this.checkboxes.push(cbox);
        }
        
        var buttons_div = document.querySelector("#townButtons");

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

    select_all() {
        for (var i = 0; i < this.checkboxes.length; i++) {
            this.checkboxes[i].checked = true;
        }
        this.filter();
    }

    deselect_all() {
        for (var i = 0; i < this.checkboxes.length; i++) {
            this.checkboxes[i].checked = false;
        }
        this.filter();
    }

    filter() {
        for (var i = 0; i < this.checkboxes.length; i++) { // could be quite slow...
            var accessor = 'label[for=' + this.checkboxes[i].id + ']';
            var state = this.checkboxes[i].checked;
            var selected = document.querySelector(accessor).innerHTML;
            this.plunder.filter_towns(selected, state);
        }
        var newData = this.plunder.apply_filters();
        // now, update other views...
        // map
        this.th.update_all(newData);
        // this.map.svg.selectAll('.foredot')
        //     .data(newData)
        //     .enter()
        //     .append("circle")
        //     .attr("class", "foredot")
        //     .attr("cx", (d) => this.map.true_projection([d["lon"], d["lat"]])[0])
        //     .attr("cy", (d) => this.map.true_projection([d["lon"], d["lat"]])[1])
        //     .attr("transform", this.map.curr_transform)
        //     .attr("r", (d) => Math.sqrt(newData.filter(el => el["town"] === d["town"]).length/2));

        // //timeline histogram
        // var bins = this.th.histogram(newData);

        // //timeline histogram
        // var bar = this.th.svg.selectAll(".forebar2")
        //     .data(bins)
        //     .enter()
        //     .append("g")
        //     .attr("class", "forebar2")
        //     .attr("transform",  (d) => "translate(" + this.th.time_xScale(d.x0) + "," + this.th.time_yScale(d.length) + ")" )

        // // timeline histogram
        // var rects = bar.append("rect")
        //     .attr("x", 1)
        //     // for width, need to make sure to not return width with negative value
        //     .attr("width",  (d) => this.th.time_xScale(d.x1) - this.th.time_xScale(d.x0) - 1 > 0 ? this.th.time_xScale(d.x1) - this.th.time_xScale(d.x0) - 1 : 0)
        //     .attr("height",  (d) => this.th.height - this.th.time_yScale(d.length))
        //     .style("fill","green");


        // // update data table
        // this.plunder_table.table.remove();
        // this.plunder_table.init();
    }
}

export default TownSelector;
