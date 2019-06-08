//
// Visualization inspired by Flight Animation with d3.js 
// Available at: http://www.tnoda.com/blog/2014-04-02
//


//
// load data files
//

var files = ["maps/italy.json", "towns.json", "data/unique_locations.csv", "data/DALME_datasets_2/lucca_people/lucca_ownership_change.csv"];
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
    lucca_ownership_change = values[3]
    console.log(values)
    
    // PREPROCESS DATA
    var pared_lucca_ownership_change = []
    for (i = 0; i < lucca_ownership_change.length; i++) { 
      if ( (lucca_ownership_change[i].former_owner_residence !== "") && (lucca_ownership_change[i].new_owner_residence !== "") && (lucca_ownership_change[i].new_owner_residence !== lucca_ownership_change[i].former_owner_residence) ){
        pared_lucca_ownership_change.push(lucca_ownership_change[i])
      }
    }
    
    console.log(pared_lucca_ownership_change)
    
    
    
    lucca_object = {town: "Lucca", lon: "10.5027", lat: "43.8429", ct: "150"}
    unique_locations.push(lucca_object)
    
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
        .style("stroke", "black")
        .attr("fill-opacity", 1.);
        
    
      var dist = get_path_length(origin_obj,destination_obj);
                    
	  console.log(dist)
      transition(red_dot, route, destination_obj,dist);
    }
    
    function get_path_length(origin_obj,destination_obj) {
      var dest_x = true_projection([destination_obj["lon"], destination_obj["lat"]])[0];
      var dest_y = true_projection([destination_obj["lon"], destination_obj["lat"]])[1];
      var source_x = true_projection([origin_obj["lon"], origin_obj["lat"]])[0];
      var source_y = true_projection([origin_obj["lon"], origin_obj["lat"]])[1];
      
      return Math.sqrt(Math.pow(source_x - dest_x,2) + Math.pow(source_y - dest_y,2))
    }
    
    function transition(red_dot, route,destination_obj,dist) {
      var l = route.node().getTotalLength();
      red_dot.transition()
        .duration(50*dist)
        .attr("cx", function (d) {
              return true_projection([destination_obj["lon"], destination_obj["lat"]])[0];
              })
        .attr("cy", function (d) {
              return true_projection([destination_obj["lon"], destination_obj["lat"]])[1];
              })
//         .attr("fill","#1da1f2")
        .on("end", function() { route.remove(); })
        .remove();
    }

    var i = 0;
    setInterval(function() {
      if (i > lucca_ownership_change.length - 1) {
        i = 0;
      }
      var od = lucca_ownership_change[i];
      const origin_obj = unique_locations.find(obj => obj.town === od.former_owner_residence);
      const destination_obj = unique_locations.find(obj => obj.town === od.new_owner_residence);
      if (origin_obj && destination_obj){
        fly(od.former_owner_residence, od.new_owner_residence);
        reformatted_date = od.date_plunder.split(" ")[1] + " " + od.date_plunder.split(" ")[2]
        d3.select('p#value-simple').text(reformatted_date);
//         console.log(i)
      }
      i++;
    }, 50);//125); //150);
    
    // Simple Slider
  	var data = [25, 50, 75, 100, 125, 150];

  	var sliderSimple = d3
      .sliderBottom()
      .min(d3.min(data))
      .max(d3.max(data))
      .width(300)
//       .tickFormat(d3.format('.2%'))
      .ticks(5)
      .default(75)
      .on('onchange', val => {
//         d3.select('p#value-simple').text(d3.format(',d')(val));
        // var i = 0;
//     	setInterval(function() {
//       	  if (i > lucca_ownership_change.length - 1) {
//         	i = 0;
//       	  }
//       	  var od = lucca_ownership_change[i];
//       	  const origin_obj = unique_locations.find(obj => obj.town === od.former_owner_residence);
//      	  const destination_obj = unique_locations.find(obj => obj.town === od.new_owner_residence);
//       	  if (origin_obj && destination_obj){
//         	fly(od.former_owner_residence, od.new_owner_residence);
// //         console.log(i)
//       	  }
//       	  i++;
//     	}, val);
      });

    var gSimple = d3
      .select('div#slider-simple')
      .append('svg')
      .attr('width', 500)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);
    
//     console.log(sliderSimple.value())

//     d3.select('p#value-simple').text(d3.format(',d')(sliderSimple.value()));
    
    
});
