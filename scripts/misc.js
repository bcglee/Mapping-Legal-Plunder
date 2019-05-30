/* *** FUNCTIONS *** */

//reset button for resetting zoom
function resetzoom() {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
};

// TODO: maybe use a different transition (fade out/in?) to avoid
// misleading users into tinking shrinking is meaningful
// function update(year, data) {
//     state.year = year;
//     var newData = data.filter(row => isYear(row, state.year) && hasLocation(row));
//     var duration = 750; // (total transition time)/2

//     // make all dots disappear
//     svg.selectAll(".backdot")
//         // transition.remove() requires elements have no pending transitions,
//         // so we change its class
//         .attr("class", "old_dot")
//         .transition("leave")
//         .remove()
//         .duration(duration)
//         .style("opacity", 0)
//         .attr("r", 0);

//     dots = svg.selectAll(".backdot").data(newData)

//     // create (invisible) points for enter()
//     dots.enter()
//         .append("circle")
//         .attr("class", "backdot")
//         .attr("cx", function (d) {
//             return true_projection([d["lon"], d["lat"]])[0];
//         })
//         .attr("cy", function (d) {
//             return true_projection([d["lon"], d["lat"]])[1];
//         })
//         .attr("transform", curr_transform)
//         .attr("fill", "red")
//         .style("opacity", 0)
//         .attr("r", 0);

//     // fade (unshrink?) points in
//     svg.selectAll(".backdot")
//         .transition("enter")
//         .duration(duration)
//         .delay(duration)
//         .style("opacity", 1)
//         .attr("r", dot_size);
// }

function isYear(row, year) {
    return row.date_year === year;
}

function hasLocation(row) {
    return row.lat !== '';
}

// function for zooming
function zoomed() {
    curr_transform = d3.event.transform;
    //transforms the map appropriately (with zoom)
    svg.selectAll('path')
        .attr('transform', d3.event.transform);

    //transforms the dots appropriately (with zoom)
    svg.selectAll(".backdot")
        .attr('transform', d3.event.transform);

    //transforms the dots appropriately (with zoom)
    svg.selectAll(".foredot")
        .attr('transform', d3.event.transform);
};

// gridlines in x axis function https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
function make_x_gridlines(scale, tickNum) {
    return d3.axisBottom(scale)
                .ticks(tickNum)
    }

// gridlines in y axis function https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
function make_y_gridlines(scale) {
    return d3.axisLeft(scale)
                .ticks(10)
    }
