//
// load data files
//

var files = ["maps/italy.json", "towns.json", "data/unique_locations.csv"];
var promises = [];
files.forEach(function(url, i) {
  if (i < 2) {
    promises.push(d3.json(url))
  } else {
    promises.push(d3.csv(url))
  }
});

//
// Main Code Block
//

Promise.all(promises).then(function(values) {
    map = values[0]
    connections = values[1]
    unique_locations = values[2]
    console.log(values)
    
    //
    // define zoomed projection for lucca
    //
    
    var width = 1000;
    var height = 400;
    
    var true_projection = d3.geoAlbers() // zoomed in on Lucca
      .center([-2, 44])
      .rotate([347.5, 0.125])
      .parallels([35, 45])
      .scale(50000)
      .translate([width / 2, height / 2]);
    
    var true_path = d3.geoPath()
      .projection(true_projection);
    
    // create svg element
    var svg = d3.select("svg"),
      margin = { right: 50, left: 50 },
      width = +svg.attr("width") - margin.left - margin.right
      height = +svg.attr("height");
    
    // show map
    svg.selectAll("path")
      .data(topojson.feature(map, map.objects.custom).features)
      .join("path")
      .attr("fill", "#3d3d3d")
      .attr("d", true_path);
    
    // plot towns
    // show dots
    
    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")  // from http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden");
    
    dots = svg.selectAll(".backdot").data(unique_locations) // selection should be empty...
    enterdots = dots.enter()
      .append("circle")
      .attr("class", "backdot")
      .attr("cx", function (d) {
        return true_projection([d["lon"], d["lat"]])[0];
        })
      .attr("cy", function (d) {
        return true_projection([d["lon"], d["lat"]])[1];
        })
      .attr("r", function(d) {
                    // return Math.log(d["ct"]+1);
        return Math.sqrt(d["ct"]/2);
        })
      .attr("fill","gray")
      .attr("fill-opacity", .75)
      .on("mouseover", function(d){return tooltip.style("visibility", "visible")
                                                           .text(d["town"]);})
                //.on("mouseover", function(d){return tooltip.text("TEST");})
      .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
    
    // animate records transfering
    
    function fly(origin, destination) {
    
      const origin_obj = unique_locations.find(obj => obj.town === origin);
      const destination_obj = unique_locations.find(obj => obj.town === destination);

      var route = svg.append("path")
        .data([ [true_projection([origin_obj["lon"], origin_obj["lat"]])], [true_projection([destination_obj["lon"], destination_obj["lat"]])] ])
        .attr("d", d3.line().curve(d3.curveCardinal.tension(0)));
      
      var red_dot = svg.append("circle")
        .attr("cx", function (d) {
              return true_projection([origin_obj["lon"], origin_obj["lat"]])[0];
              })
        .attr("cy", function (d) {
              return true_projection([origin_obj["lon"], origin_obj["lat"]])[1];
              })
        .attr("r", function(d) {
              return Math.sqrt(10);
              })
        .attr("fill","red")
        .attr("fill-opacity", 1.);
                    

      transition(red_dot, route, destination_obj);
    }
    
    function transition(red_dot, route,destination_obj) {
      var l = route.node().getTotalLength();
      red_dot.transition()
        .duration(5000)
        .attr("cx", function (d) {
              return true_projection([destination_obj["lon"], destination_obj["lat"]])[0];
              })
        .attr("cy", function (d) {
              return true_projection([destination_obj["lon"], destination_obj["lat"]])[1];
              })
        .attr("fill","#1da1f2")
        .on("end", function() { route.remove(); })
        .remove();
    }
    
    function translateAlong(route) {
    var l = route.getTotalLength();
    return function (d) {
      return function (t) {
        var p = route.getPointAtLength(t * l);
        return "translate(" + p.x + "," + p.y + ")";//Move marker
      }
    }
  }
    
    var i = 1;
    setInterval(function() {
      if (i > connections.links.length - 1) {
        i = 1;
      }
      var od = connections.links[i];
      const origin_obj = unique_locations.find(obj => obj.town === od.source);
      const destination_obj = unique_locations.find(obj => obj.town === od.target);
      if (origin_obj && destination_obj){
        fly(od.source, od.target);
        console.log(i)
      }
      i++;
    }, 15); //150);
    
    
});



// TO DO LIST:
// 1. Make the transition length scale with the distance between the two points
// 2. Find the geographical coordinates for missing cities
// 3. Remove self-connections (e.g. Lucca to Lucca) from the data set
// 4. Randomly sample from connections rather than looping through them