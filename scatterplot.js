// Health statistics

// Set margins
let svgWidth = 960;
let svgHeight = 500;

let margin = {
  top: 20,
  right: 40,
  bottom: 140,
  left: 110
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold the chart,
// and shift the latter by left and top margins.
let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "obesity";
let chosenYAxis = "respiratory";

// function used for updating x-scale upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

// function used for updating y-scale upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.1
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }
  
// function used for updating xAxis upon click on axis label
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

//function used for updating yAxis upon click on axis label
function renderAxesY(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating flags group with a transition to
// new flag positions
function renderFlags(flagsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    flagsGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]) - 20)
      .attr("y", d => newYScale(d[chosenYAxis]) - 20);
      

    return flagsGroup;
  }

// function used for updating country labels with a transition
// function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

//     textGroup.transition()
//         .duration(1000)
//         .attr("x", d => newXScale(d[chosenXAxis]))
//         .attr("y", d => newYScale(d[chosenYAxis]));

//     return textGroup;
// }

// function used for updating flags group with new tooltip 
function updateToolTip(chosenXAxis, chosenYAxis, flagsGroup) {
    let label  = "";
    if (chosenXAxis === "obesity") {
        label = "Obesity (%): ";
    }

    else if (chosenXAxis === "depression") { 
         label = "Depression (%): ";   

    }

    else if (chosenXAxis === "bloodpressure") { 
        label = "Blood Press. (%): ";   

   }

    else if (chosenXAxis === "exercise") { 
    label = "Insuff. Exercise (%): ";   

    }

    else {
        label = "Alcoholism (liters): ";
    }

    // select y label
     let yLabel = "";
    if (chosenYAxis === "cancer") {
         yLabel = "Cancer (%): "
    }

    else if (chosenYAxis === "diabetes") {
         yLabel = "Diabetes (%): "
    }

    else if (chosenYAxis === "respiratory") {
        yLabel = "Ch. Resp. Dis. (%): "
   }
    
    else {
         yLabel = "Cv. Dis. (deaths/1k): "
    }

    let toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.country}<br>Spending ($): ${d.spending}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });

    flagsGroup.call(toolTip);

    flagsGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data, this);
    });

  return flagsGroup;
}

// Retrieve data and execute everything below
(async function(){
    // let healthData = await d3.csv("data.csv");
    var scatter = "/flags"
    healthData = await d3.json(scatter);

    // parse data
    healthData.forEach(function(data) {
        // x-axis
        data.obesity = +data.obesity;
        data.depression = +data.depression;
        data.alcoholism = +data.alcoholism;
        data.bloodpressure = +data.bloodpressure;
        data.exercise = +data.exercise;
        // y-axis
        data.respiratory = +data.respiratory;
        data.cancer = +data.cancer;
        data.cardiovascular = +data.cardiovascular;
        data.diabetes = +data.diabetes;
    });

    // xLinearScale function above csv import
    let xLinearScale = xScale(healthData, chosenXAxis);

    // Create y scale function
    let yLinearScale = yScale(healthData, chosenYAxis);
  
    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    //append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    // let circlesGroup = chartGroup.selectAll("circle")
    //     .data(healthData)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //     .attr("cy", d => yLinearScale(d[chosenYAxis]))
    //     .attr("r", 20)
    //     .attr("opacity", ".8")
    //     .attr("fill", "red");
    
    // append initial flags
        // var svg = d3.select('body').append('svg');
        let flagsGroup = chartGroup.selectAll('.myPoint')
          .append(".myPoint")  
          .data(healthData)
          .enter()
          .append('image')
          .attr("xlink:href", function(d){ return d.src })
          .attr("x", d => xLinearScale(d[chosenXAxis]) - 20)
          .attr("y", d => yLinearScale(d[chosenYAxis]) - 20)
          .attr("width", 40)
          .attr("height", 40);

    // append country abbreviations
    // let textGroup = chartGroup.selectAll(".stateText")
    //     .data(healthData)
    //     .enter()
    //     .append("text")
    //     .classed("stateText", true)
    //     .attr("x", d => xLinearScale(d[chosenXAxis]))
    //     .attr("y", d => yLinearScale(d[chosenYAxis]))
    //     .attr("dy", 3)
    //     .attr("font-size", "10px")
    //     .text(function(d) {return d.abbrv});

    // Create group for 5 x- axis labels
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let obesityLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obesity (%)");

    let depressionLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "depression") // value to grab for event listener
        .classed("inactive", true)
        .text("Depression (%)");

    let alcoholismLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "alcoholism") // value to grab for event listener
        .classed("inactive", true)
        .text("Alcoholism (liters/person/year)");

    let exerciseLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 80)
        .attr("value", "exercise") // value to grab for event listener
        .classed("inactive", true)
        .text("Insufficient Exercise (%)");
    
    let bloodpressureLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 100)
        .attr("value", "bloodpressure") // value to grab for event listener
        .classed("inactive", true)
        .text("High Blood Pressure (%)");    

    //create group for 4 y-axis labels
    let yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    let respiratoryLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 45)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "respiratory")
        .text("Chronic Respiratory Disease (%)");

    let cancerLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 25)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "cancer")
        .text("Cancer (%)");

    let cardiovascularLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 65)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "cardiovascular")
        .text("Cardiovascular Disease (Deaths/1,000)");

    let diabetesLabel = yLabelsGroup.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 85)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "diabetes")
        .text("Diabetes (%)");

    // updateToolTip function above csv import
    flagsGroup = updateToolTip(chosenXAxis, chosenYAxis, flagsGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        let value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates flags with new x values
            flagsGroup = renderFlags(flagsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // update country abbreviations
            //textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            flagsGroup = updateToolTip(chosenXAxis, chosenYAxis, flagsGroup);

            // changes classes to change bold text
            if (chosenXAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                depressionLabel
                    .classed("active", false)
                    .classed("inactive", true);
                alcoholismLabel
                    .classed("active", false)
                    .classed("inactive", true); 
                bloodpressureLabel
                    .classed("active", false)
                    .classed("inactive", true);
                exerciseLabel
                    .classed("active", false)
                    .classed("inactive", true);   
            }
            else if (chosenXAxis ==="depression") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                depressionLabel
                    .classed("active", true)
                    .classed("inactive", false);
                alcoholismLabel
                    .classed("active", false)
                    .classed("inactive", true); 
                bloodpressureLabel
                    .classed("active", false)
                    .classed("inactive", true);
                exerciseLabel
                    .classed("active", false)
                    .classed("inactive", true);  
            }
            else if (chosenXAxis ==="alcoholism") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                depressionLabel
                    .classed("active", false)
                    .classed("inactive", true);
                alcoholismLabel
                    .classed("active", true)
                    .classed("inactive", false); 
                bloodpressureLabel
                    .classed("active", false)
                    .classed("inactive", true);
                exerciseLabel
                    .classed("active", false)
                    .classed("inactive", true);  
            }
            else if (chosenXAxis ==="bloodpressure") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                depressionLabel
                    .classed("active", false)
                    .classed("inactive", true);
                alcoholismLabel
                    .classed("active", false)
                    .classed("inactive", true); 
                bloodpressureLabel
                    .classed("active", true)
                    .classed("inactive", false);
                exerciseLabel
                    .classed("active", false)
                    .classed("inactive", true);  
            }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                depressionLabel
                    .classed("active", false)
                    .classed("inactive", true);
                alcoholismLabel
                    .classed("active", false)
                    .classed("inactive", true); 
                bloodpressureLabel
                    .classed("active", false)
                    .classed("inactive", true);
                exerciseLabel
                    .classed("active", true)
                    .classed("inactive", false);

            }
        }
    });

    // y-axis labels event listener
        yLabelsGroup.selectAll("text")
        .on("click", function() {
            //get value of selection
            let value = d3.select(this).attr("value");
    
            //check if value is same as current axis
            if (value != chosenYAxis) {
    
                // replace chosenYAxis with value
                chosenYAxis = value;
    
                //u pdate y scale for new data
                yLinearScale = yScale(healthData, chosenYAxis);
    
                // update y axis with transition
                yAxis = renderAxesY(yLinearScale, yAxis);
    
                // update flags with new y values
                flagsGroup = renderFlags(flagsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
                // update countries with new y values
                //textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
    
                // update tooltips with new info
                flagsGroup = updateToolTip(chosenXAxis, chosenYAxis, flagsGroup);
    
                //change classes to change bold text
                if (chosenYAxis === "cancer") {
                    respiratoryLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    cancerLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    cardiovascularLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    diabetesLabel
                      .classed("active", false)
                      .classed("inactive", true);
                }
                else if (chosenYAxis === "respiratory") {
                    respiratoryLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    cancerLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    cardiovascularLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    diabetesLabel
                      .classed("active", false)
                      .classed("inactive", true);
                }

                else if (chosenYAxis === "cardiovascular") {
                    respiratoryLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    cancerLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    cardiovascularLabel
                      .classed("active", true)
                      .classed("inactive", false);
                    diabetesLabel
                      .classed("active", false)
                      .classed("inactive", true);
                }

                else {
                    respiratoryLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    cancerLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    cardiovascularLabel
                      .classed("active", false)
                      .classed("inactive", true);
                    diabetesLabel
                      .classed("active", true)
                      .classed("inactive", false);
                }
            }
        });
})()

