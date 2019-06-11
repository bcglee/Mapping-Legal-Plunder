class PlunderTable {
    constructor (plunder) {
        this.plunder = plunder;
        this.init();
    }

init() {
    var ptable;

    //https://codepen.io/pj_/pen/aVEBOm

    // use es6 string templates to populate rows
    this.rowTemplate = (d) => {
        return `
        <td>${d.object}</td>
        <td>${d.object_category}</td>
        <td>${d.town}</td>
        <td>${d.id}</td>
        `;
    };


        var p = this.plunder.apply_filters();

        // select viz and append table
        this.table = d3.select("#tableViewer").append("table");

        // append headers
        var header = this.table.append("thead")
            .selectAll('th')
            .data(["Object", "Object Category", "Town", "ID"])
            .enter().append('th')
            .text(d => d);

            var clicks = {id: 0, object: 0, object_category: 0, town: 0};

            
        // append rows with rowTemplate
        

        // var that=this

        // header
        //     .on("click", function(d) {
        //       if (d == "ID") {
        //         clicks.id++;
        //         // even number of clicks
        //         if (clicks.id % 2 == 0) {
        //           // sort ascending: alphabetically
        //           that.rows.sort(function(a,b) { 
        //             if (a < b) {
        //               return -1; 
        //             } else if (a > b) { 
        //               return 1; 
        //             } else {
                        
        //               return 0;
        //             }
        //           });
        //         // odd number of clicks  
        //         } else if (clicks.title % 2 != 0) { 
        //           // sort descending: alphabetically
        //           that.rows.sort(function(a,b) { 
        //             if (a < b) { 
        //               return 1; 
        //             } else if (a > b) { 
        //               return -1; 
        //             } else {
        //               return 0;
        //             }
        //           });
        //         }
        //       } 
        
     
        //     }) 
            this.rows = this.table.append("tbody");


    }

}

export default PlunderTable;
