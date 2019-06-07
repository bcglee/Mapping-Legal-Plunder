class PlunderTable {
    constructor (plunder) {
        this.plunder = plunder;
        this.init();
    }

init() {
        var ptable;

        //https://codepen.io/pj_/pen/aVEBOm

        const url = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1245865/summer-olympics.csv";

        // use es6 string templates to populate rows
        const rowTemplate = (d) => {
          return `
          <td>${d.object}</td>
          <td>${d.object_category}</td>
          <td>${d.town}</td>
          `;
        };

        // read data from the url
        d3.csv(url, (data, err) => {

          var plunder = this.plunder.apply_filters();

          // select viz and append table
          const table = d3.select("#plunderTable").append("table");

          // append headers
          const header = table.append("thead")
            .selectAll('th')
            .data(["Object", "Object Category", "Town"])
            .enter()
            .append('th')
            .text(d => d);

          // append rows with rowTemplate
          const rows = table.append("tbody")
            .selectAll("tr")
            .data(data)
            .enter()
            .append("tr")
            .html(rowTemplate);

        })

          //  div.appendChild(ptable);
          //  div.appendChild(document.createElement("br"));
        }
}

export default PlunderTable;
