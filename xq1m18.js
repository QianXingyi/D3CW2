var viewNumber = 0;
$(document).ready(function () {
    dataRefresh(viewNumber);
});

function viewType(number) {
    viewNumber = number;
    dataRefresh(viewNumber);
    changeType(viewNumber);
}

function changeType(number) {
    var dataType_array = ["Number", "Weight (kg)"];
    document.getElementById("svgTitleBar").innerHTML = dataType_array[number] +
        " of Factories by Area";
    document.getElementById("svgTitlePie").innerHTML = "Pollution Structure Details of " + dataType_array[
        number];

}


function dataRefresh(dataType) {
    changeType(viewNumber);
    //console.log(dataType);
    var dataType_array = ["Number", "Weight (kg)"];
    d3.select("div#pieSvgDiv").selectAll("svg").remove();
    d3.select("div#barSvgDiv").selectAll("svg").remove();
    var pollution = new Array();
    d3.queue()
        .defer(d3.csv, "pollution-inventory-csv.csv",
            function (data, i) {
                return {
                    id: i,
                    area_name: data["EA AREA NAME"],
                    latitude: data["LAT"],
                    longitude: data["LONG"],
                    name: data["OPERATOR NAME"],
                    released: data["QUANTITY RELEASED"],
                    industry_sector: data["REGULATED INDUSTRY SECTOR"],
                    sub_sector: data["REGULATED INDUSTRY SUB - SECTOR"],
                    threshold: data["REPORTING THRESHOLD"],
                    route_name: data["ROUTE NAME"],
                    address: data["SITE ADDRESS"],
                    postcode: data["SITE POSTCODE"],
                    subatance_name: data["SUBSTANCE NAME"],
                    year: data["YEAR"]

                };
            }).await(readData);

    function readData(error, pollution_data) {
        if (error) {
            console.log(error);
            return;
        }
        var block = new Array();
        var block_data = new Set();
        var block_set = new Set();
        var postcode_pollution = new Set();
        var type = new Set();
        var type_detail = new Set();
        for (let index = 0; index < pollution_data.length; index++) {
            const element = pollution_data[index].postcode;
            var areaID = element.slice(2, 4);
            block[index] = parseInt(areaID);
            block_set.add(block[index]);
            postcode_pollution.add(element);
            type.add(pollution_data[index].route_name);
            type_detail.add(pollution_data[index].subatance_name);
        }
        console.log(postcode_pollution);
        console.log(block);
        console.log(type);
        console.log(type_detail);
        var postcode_pollution_array = Array.from(postcode_pollution);
        var type_array = Array.from(type);

        console.log(postcode_pollution_array);
        var location_pollution = new Set();
        var block_map = Array.from(block_set);
        var block_map_count = new Array(block_map.length);
        for (let index = 0; index < block_map.length; index++) {
            block_map_count[index] = 0;
        }
        console.log(block_map);
        for (let index = 0; index < block_map.length; index++)
            for (let j = 0; j < block.length; j++)
                if (block[j] == block_map[index])
                    block_map_count[index]++;

        for (let j = 0; j < postcode_pollution_array.length; j++) {
            var isSaved = false;
            for (let index = 0; index < pollution_data.length; index++) {

                if (pollution_data[index].postcode == postcode_pollution_array[j]) {
                    var temp_location = new Object();
                    temp_location["postcode"] = pollution_data[index].postcode;
                    temp_location["latitude"] = pollution_data[index].latitude;
                    temp_location["longitude"] = pollution_data[index].longitude;
                    temp_location["name"] = pollution_data[index].name;

                    temp_location["block"] = block[index];
                    if (!isSaved)
                        location_pollution.add(temp_location);
                    isSaved = true;
                }

            }


        }
        var areas_all = new Array();
        var areas = new Array(block_map.length);
        for (let j = 0; j < block_map.length; j++) {
            var pollution_number_temp = new Array(type_array.length);
            var pollution_kg_temp = new Array(type_array.length);
            var temp = new Object();
            var all_temp = new Array(type_array.length);

            var all_temp_all = new Array(type_array.length);
            temp["id"] = block_map[j];
            temp["name"] = "BS" + block_map[j];
            temp["number"] = new Object();
            temp["release"] = new Object();

            var pollution_number_temp_all = new Array(type_array.length);
            var pollution_kg_temp_all = new Array(type_array.length);
            var temp_all = new Object();

            temp_all["id"] = 0;
            temp_all["name"] = "BS" + "0";
            temp_all["number"] = new Object();
            temp_all["release"] = new Object();

            for (let index = 0; index < type_array.length; index++) {
                pollution_number_temp_all[index] = 0;
                pollution_kg_temp_all[index] = 0;
                pollution_number_temp[index] = 0;
                pollution_kg_temp[index] = 0;
            }
            for (let i = 0; i < block.length; i++) {
                for (let index = 0; index < type_array.length; index++) {
                    if (pollution_data[i].route_name == type_array[index] && block[i] == block_map[j]) {
                        pollution_number_temp[index] += 1;
                        if (pollution_data[i].released != "")
                            pollution_kg_temp[index] += parseFloat(pollution_data[i].released);
                    }
                    if (pollution_data[i].route_name == type_array[index]) {
                        pollution_number_temp_all[index] += 1;
                        if (pollution_data[i].released != "")
                            pollution_kg_temp_all[index] += parseFloat(pollution_data[i].released);
                    }

                }

            }

            for (let index = 0; index < type_array.length; index++) {
                temp["number"][type_array[index].replace(/ /g, "_")] = pollution_number_temp[index];
                temp["release"][type_array[index].replace(/ /g, "_")] = pollution_kg_temp[index];
                temp_all["number"][type_array[index].replace(/ /g, "_")] = pollution_number_temp_all[index];
                temp_all["release"][type_array[index].replace(/ /g, "_")] = pollution_kg_temp_all[index];
            }
            areas[j] = temp;
            areas_all[0] = temp_all;

        }
        console.log(areas);
        console.log(areas_all);
        console.log(location_pollution);
        console.log(block_map_count);
        var locations = Array.from(location_pollution);
        var colour = d3.scaleOrdinal(d3.schemeCategory20);
        var barData = areas;
        var pieData = new Array();
        if (dataType == 0) {
            pieData = areas_all[0].number;
        } else if (dataType == 1) {
            pieData = areas_all[0].release;

        }
        var margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 30
        };
        const t = d3.transition().duration(750);
        var width = 480,
            pieWidth = 360;
        var height = 400,
            pieHeight = 360;
        var colour = d3.scaleOrdinal(d3.schemeCategory10);
        var radius = Math.min(pieWidth, pieHeight) / 2;


        function drawBars() {
            var barSvg = d3.select('body').select('div#barSvgDiv')
                .append('svg')
                .attr("id", "barChart")
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ")");

            //A Band scale is good for discrete values, such as the number of bars in a bar chart
            var y = d3.scaleBand()
                .domain(barData.map(function (d) {
                    return d.id;
                }))
                .range([0, height])
                .padding(0.1);
            //console.log(y.bandwidth());
            //A Linear scale is good for continuous values, such as real numbers
            var x = d3.scaleLinear()
                .domain([0, d3.max(barData, function (d) {
                    if (dataType == 0) {
                        console.log(d);
                        var all = 0;
                        for (let index = 0; index < type_array.length; index++) {
                            all += d.number[type_array[index].replace(/ /g, "_")];
                        }
                        return all;
                    } else if (dataType == 1) {
                        return 280;
                    }
                })])
                .range([0, width - 80]);

            var bars = barSvg.selectAll(".bar")
                .data(barData)
                .enter()
                .append("g")
                .attr("class", "bar");

            bars.append("rect")
                .attr("height", y.bandwidth())

                .attr("x", 0)
                .attr("y", function (d) {
                    return y(d.id);
                })
                .transition(t)
                .attr("width", function (d) {
                    if (dataType == 0) {
                        var all = 0;
                        for (let index = 0; index < type_array.length; index++) {
                            all += d.number[type_array[index].replace(/ /g, "_")];
                        }
                        return all;
                    } else if (dataType == 1) {
                        var all = 0;
                        for (let index = 0; index < type_array.length; index++) {
                            all += d.release[type_array[index].replace(/ /g, "_")];
                        }
                        if (parseInt(all / 1000) >= 280) {
                            return 280;
                        } else
                            return parseInt(all / 1000);
                    }
                })
                .attr("fill", function (d) {
                    return colour(d.id);
                });
            bars.append("text")
                .attr("class", "label")

                .attr("y", function (d) {

                    return y(d.id) + y.bandwidth() / 2;
                })
                .transition(t)
                .attr("x", function (d) {
                    if (dataType == 0) {
                        var all = 0;
                        for (let index = 0; index < type_array.length; index++) {
                            all += d.number[type_array[index].replace(/ /g, "_")];
                        }
                        return all;
                    } else if (dataType == 1) {
                        var all = 0;
                        for (let index = 0; index < type_array.length; index++) {
                            all += d.release[type_array[index].replace(/ /g, "_")];
                        }
                        if (parseInt(all / 1000) >= 280) {
                            return 280;
                        } else
                            return parseInt(all / 1000);
                    }
                })
                .text(function (d) {
                    if (dataType == 0) {
                        var all = 0;
                        for (let index = 0; index < type_array.length; index++) {
                            all += d.number[type_array[index].replace(/ /g, "_")];
                        }
                        return all;
                    } else if (dataType == 1) {
                        var all = 0;
                        for (let index = 0; index < type_array.length; index++) {
                            all += d.release[type_array[index].replace(/ /g, "_")];
                        }
                        if (all - parseInt(all) != 0)
                            return all.toFixed(2);
                        else
                            return all;
                    }
                })
                .style("font-size", 15);;
            //Add the x axis
            barSvg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            barSvg.append("g")
                .call(d3.axisLeft(y).tickSize(0)
                    .tickFormat(function (d, i) {
                        return barData[i].name;
                    })
                );
            bars.on("mouseover", mouseover)
                .on("mouseout", mouseout);

        }

        function drawPie(dataOfPie) {
            //console.log(pieData);
            colour = d3.scaleOrdinal(d3.schemeCategory10);
            var total = 0;
            var arc = d3.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.5);

            var labelArc = d3.arc()
                .outerRadius(radius * 0.7)
                .innerRadius(radius * 0.7);

            var pieSvg = d3.select('body').select('div#pieSvgDiv')
                .append('svg')
                .attr("id", "pieChart")
                .attr('width', pieWidth)
                .attr('height', pieHeight)
                .append("g")
                .attr("transform", "translate(" + (pieWidth / 2) + "," + (pieHeight / 2) + ")")
                .data(Object.values(dataOfPie));
            var pie = d3.pie()
                .sort(null)
                .value(function (d) {
                    return d;
                });
            var gPie = pieSvg.selectAll(".arc")
                .data(pie(Object.values(dataOfPie)))
                .enter().append("g")
                .attr("class", "arc");

            gPie.append("path")
                .attr("d", arc)
                .style("fill", function (d, i) {
                    //console.log(d);
                    total += d.data;
                    return colour(i);
                });

            gPie.append("text")
                .attr("transform", function (d) {
                    return "translate(" + labelArc.centroid(d) + ")";
                })
                .attr("text-anchor", "middle")
                .text(function (d, i) {
                    if (d.data != 0)
                        return (100 * d.data / total).toFixed(2) + "%";
                });
            colour = d3.scaleOrdinal(d3.schemeCategory10);
            var legendSvg = d3.select('body').select('div#pieSvgDiv')
                .append('svg')
                .attr("id", "legendChart")
                .attr('width', width / 3)
                .attr('height', height)
                .append('g')
                .attr('x', 0)
                .attr('y', 0)
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ")")
                .append("g")
                .attr("class", "legend");
            var legend = legendSvg.selectAll(".legend")
                .data(pie(Object.values(dataOfPie)))
                .enter().append("g")
                .attr("transform", function (d, i) {
                    {
                        //console.log(i);
                        return "translate(0," + i * 20 + ")";
                    }
                });
            legend.append('rect')
                .attr("x", 0)
                .attr("y", 70)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function (d, i) {
                    //console.log(d)
                    return colour(i);

                });

            legend.append("text")
                .attr("x", 20)
                .attr("y", 75)
                .attr("dy", ".35em")
                .text(function (d, i) {
                    return type_array[i] + ":" + (100 * d.data / total).toFixed(2) + "%";

                })
                .attr("class", "textselected")
                .style("text-anchor", "start")
                .style("font-size", 10);

            legend.append("text")
                .attr("x", 20)
                .attr("y", 85)
                .attr("dy", ".35em")
                .text(function (d, i) {
                    return d.data.toFixed() + "kg";

                })
                .attr("class", "textselected")
                .style("text-anchor", "start")
                .style("font-size", 10);
        }


        function drawMap() {
            d3.select('body').select("div#map").select("svg").remove();
            var mapWidth = document.getElementById("alertInfo").offsetWidth;
            var mapHeight = mapWidth;
            var scale = 200000;
            var projection = d3.geoConicConformal()
                .center([-2.6556278813, 51.4865158289])
                .scale(scale);
            var path = d3.geoPath()
                .projection(projection);
            var map = d3.select("div#map").append("svg")
            boundary = map.append("g")
                .attr("class", "boundary");
            insideBoundary = map.append("g")
                .attr("class", "inside");
            blockSvg = map.append("g")
                .attr("class", "blocks");
            circleSvg = map.append("g")
                .attr("class", "circles");
            map.attr("id", "mapSvg")
                .attr("width", mapWidth)
                .attr("height", mapHeight);
            d3.json("bristol-boundary-mask.geojson", function (mapjson) {

                boundary.selectAll(".boundary")
                    .data(mapjson.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", "steelblue")
                    .style("opacity", 0.1);
            });
            d3.json("ward-boundaries-may-1999-to-april-2016.geojson", function (mapjson) {

                insideBoundary.selectAll(".inside")
                    .data(mapjson.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", "steelblue")
                    .attr('stroke', 'red')
                    .style("opacity", 0.3)
                    .on("mouseover", function (d) {
                        thisMap = 0;
                        d3.select(this).attr('stroke', 'blue');
                        updateSelected(this, d, thisMap);
                    })
                    .on("mouseout", function (d) {
                        thisMap = 0;
                        d3.select(this).attr('stroke', 'red');
                        updateSelected(this, d, thisMap);
                    });
            });
            d3.json("neighbourhood.geojson", function (mapjson) {
                var areaID = 0;
                isMap = 1;
                blockSvg.selectAll(".blocks")
                    .data(mapjson.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("fill", function (d) {
                        areaID = areaID + 1;
                        console.log(areaID);
                        return colour(areaID);

                    })
                    .style("opacity", 0.6)
                    .on("mouseover", function (d) {
                        d3.select(this).attr('stroke', 'black');
                        updateSelected(this, d, isMap);
                    })
                    .on("mouseout", function (d) {
                        d3.select(this).attr('stroke', 'null');
                        updateSelected(this, d, isMap);
                    });




            });
            var area_Id = 0;

            function updateSelected(el, thisdata, isMap) {
                // we've clicked on the currently active country
                // deactivate it and hide the tooltip
                if (d3.select(el).classed("active")) {
                    d3.select(el).classed("active", false);
                    d3.select("#map_tooltip").classed("active", false);
                    return;
                }

                // make sure no country is active
                map.selectAll("path.active").classed("active", false);

                // make the country that was clicked on active
                d3.select(el).classed("active", true);

                // write tooltip message and move it into position
                switch (isMap) {
                    case 0:
                        var msg = ("Name:<br/>" + thisdata.properties.ward_name +
                            "<br/>Area/m2:<br/>" + thisdata.properties.area_m2);

                        break;
                    case 1:
                        var msg = ("Name:<br/>" + thisdata.properties.name +
                            "<br/>Area/Ha:<br/>" + thisdata.properties.area_ha);
                        break;
                    case 2:
                        var msg = ("Name:<br/>" + thisdata.name +
                            "<br/>Postcode:<br/>" + thisdata.postcode);
                        break;

                    default:
                        break;
                }

                d3.select("#map_tooltip").html(msg)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 50) + "px")
                    .style("width", "100px");

                // make sure tooltip is visible
                d3.select("#map_tooltip").classed("active", true);
            }
            var circles = circleSvg.selectAll(".circles")
                .data(locations).enter();

            colour = d3.scaleOrdinal(d3.schemeCategory20);
            circles.append("circle")
                .attr("class", "point")
                .attr("cx", function (d) {
                    return projection([d.longitude, d.latitude])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.longitude, d.latitude])[1];
                })
                .attr("r", 5)
                .style("fill", function (d) {
                    return colour(d.block);

                }).on("mouseover", function (d) {
                    thisMap = 2;
                    d3.select(this).attr('stroke', 'black');
                    updateSelected(this, d, thisMap);
                })

                .on("mouseout", function (d) {
                    thisMap = 2;
                    d3.select(this).attr('stroke', 'null');
                    updateSelected(this, d, thisMap);
                })
                .on("click", function (d) {
                    var post = d.postcode;
                    var iD = post.slice(2, 4);
                    for (let index = 0; index < areas.length; index++) {
                        if (areas[index].id == parseInt(iD)) {
                            mouseover(areas[index]);
                        }

                    }


                });

        }

        function mouseover(d) {
            document.getElementById("svgTitleBar").innerHTML = dataType_array[dataType] + " of Power Station Statistics by Country";
            document.getElementById("svgTitlePie").innerHTML = d.name + "'s Fuel Structure Details of " + dataType_array[dataType];

            var pieSvg = d3.select('body').select('div#pieSvgDiv').select("#pieChart");
            pieSvg.remove();
            var legend = d3.select('body').select('div#pieSvgDiv').select("#legendChart");
            legend.remove();
            if (viewNumber == 0) {
                drawPie(d.number);
            } else if (dataType == 1) {
                drawPie(d.release);
            }
        }

        function mouseout(d) {
            document.getElementById("svgTitleBar").innerHTML = dataType_array[dataType] + " of Factories by Area";
            document.getElementById("svgTitlePie").innerHTML = "Pollution Structure Details of " + dataType_array[dataType];
            var pieSvg = d3.select('body').select('div#pieSvgDiv').select("#pieChart");
            pieSvg.remove();
            var legend = d3.select('body').select('div#pieSvgDiv').select("#legendChart");
            legend.remove();
            drawPie(pieData);

        }
        var barChart = drawBars();
        var pieChart = drawPie(pieData);
        var mapChart = drawMap();
    }

}