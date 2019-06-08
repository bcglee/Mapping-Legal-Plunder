class PlunderTable {
    constructor (plunder) {
        this.plunder = plunder;
        this.init();
    }

init() {
    var ptable;

    //https://codepen.io/pj_/pen/aVEBOm

    // use es6 string templates to populate rows
    const rowTemplate = (d) => {
        return `
        <td>${d.object}</td>
        <td>${d.object_category}</td>
        <td>${d.town}</td>
        `;
    };


        var p = this.plunder.apply_filters();

        // select viz and append table
        this.table = d3.select("#tableViewer").append("table");

        // append headers
        const header = this.table.append("thead")
        .selectAll('th')
        .data(["Object", "Object Category", "Town"])
        .enter()
        .append('th')
        .text(d => d);

        // append rows with rowTemplate
        const rows = this.table.append("tbody")
        .selectAll("tr")
        .attr("class", ".tr")
        .data(p)
        .enter()
        .append("tr")
        .html(rowTemplate);

    }

}

export default PlunderTable;
