// Initial Params for x and y variables 
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Create a funciton for X Scale + update axis var upon click on axis label
function xScale(data, chosenXAxis, chartWidth) {
  // Create scales.
  var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.1])
      .range([0, chartWidth]);
  return xLinearScale;
}

function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  return xAxis;
}

// Create a funciton for Y Scale + update axis var upon click on axis label
function yScale(data, chosenYAxis, chartHeight) {
  // Create scales.
  var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2])
      .range([chartHeight, 0]);
  return yLinearScale;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  return yAxis;
}

// Function used for updating circles and text group with a transition to new circles and new text respectively.
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

function renderText(circlesTextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesTextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  return circlesTextGroup;
}

// Function used for updating circles group with new tooltip.
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesTextGroup) {
  // Conditional for X Axis.
  var xlabel;
  if (chosenXAxis === "poverty") {
      xlabel = "Poverty: ";
  } else if (chosenXAxis === "income") {
      xlabel = "Median Income: "
  } else {
      xlabel = "Age: "
  }
  // Conditional for Y Axis.
  var ylabel;
  if (chosenYAxis === "healthcare") {
      ylabel = "Lacks Healthcare: ";
  } else if (chosenYAxis === "smokes") {
      ylabel = "Smokers: "
  } else {
      ylabel = "Obesity: "
  }
  // Define tooltip.
  var toolTip = d3.tip()
      .offset([100, -50])
      .attr("class", "d3-tip")
      .html(function (d) {
          if (chosenXAxis === "age") {
              // All yAxis tooltip labels presented and formated as %.
              // Display Age without format for xAxis.
              return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
          } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
              // Display Income in dollars for xAxis.
              return (`${d.state}<br>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
          } else {
              // Display Poverty as percentage for xAxis.
              return (`${d.state}<br>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
          }
      });
  circlesGroup.call(toolTip);
  // Create "mouseover" event listener to display tool tip.
  circlesGroup
      .on("mouseover", function (data) {
          toolTip.show(data, this);
      })
      .on("mouseout", function (data) {
          toolTip.hide(data);
      });
  circlesTextGroup
      .on("mouseover", function (data) {
          toolTip.show(data, this);
      })
      .on("mouseout", function (data) {
          toolTip.hide(data);
      });
  return circlesGroup;
}

function makeResponsive() {
  // Select div by id.
  var svgArea = d3.select("#scatter").select("svg");
  // Clear SVG.
  if (!svgArea.empty()) {
      svgArea.remove();
  }
  //SVG params.
  var svgHeight = window.innerHeight / 1.2;
  var svgWidth = window.innerWidth / 1.25;
  // Margins.
  var margin = {
      top: 50,
      right: 50,
      bottom: 110,
      left: 90
  };
  // Chart area minus margins.
  var chartHeight = svgHeight - margin.top - margin.bottom;
  var chartWidth = svgWidth - margin.left - margin.right;
  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);
  // Append an SVG group
  var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  d3.csv("assets/data/data.csv").then(function (censusData, err) {
      if (err) throw err;
      // Parse data from strings to integer 
      censusData.forEach(function (data) {
          data.poverty = +data.poverty;
          data.healthcare = +data.healthcare;
          data.age = +data.age;
          data.smokes = +data.smokes;
          data.income = +data.income;
          data.obesity = data.obesity;
      });

      // Create x/y linear scales.
      var xLinearScale = xScale(censusData, chosenXAxis, chartWidth);
      var yLinearScale = yScale(censusData, chosenYAxis, chartHeight);

      // Create initial axis functions.
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      // Append x axis.
      var xAxis = chartGroup.append("g")
          .attr("transform", `translate(0, ${chartHeight})`)
          .call(bottomAxis);
      // Append y axis.
      var yAxis = chartGroup.append("g")
          .call(leftAxis);

      // Set data used for circles.
      var circlesGroup = chartGroup.selectAll("circle")
          .data(censusData);
      // Bind data.
      var bindData = circlesGroup.enter();
      // Create circles.
      var circle = bindData.append("circle")
          .attr("cx", d => xLinearScale(d[chosenXAxis]))
          .attr("cy", d => yLinearScale(d[chosenYAxis]))
          .attr("r", 17)
          .classed("stateCircle", true);
      // Create circle text.
      var circleText = bindData.append("text")
          .attr("x", d => xLinearScale(d[chosenXAxis]))
          .attr("y", d => yLinearScale(d[chosenYAxis]))
          .attr("dy", ".30em")
          .text(d => d.abbr)
          .classed("stateText", true);
      // Update tool tip function above csv import.
      var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
      // Add x label groups and labels.
      var xLabelsGroup = chartGroup.append("g")
          .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

      var povertyLabel = xLabelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 20)
          .attr("value", "poverty") // value to grab for event listener
          .classed("active", true)
          .text("In Poverty (%)");

      var ageLabel = xLabelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 40)
          .attr("value", "age") // value to grab for event listener
          .classed("inactive", true)
          .text("Age (Median)");

      var incomeLabel = xLabelsGroup.append("text")
          .attr("x", 0)
          .attr("y", 60)
          .attr("value", "income") // value to grab for event listener
          .classed("inactive", true)
          .text("Household Income (Median)");

      // Add y labels group and labels.
      var yLabelsGroup = chartGroup.append("g")
          .attr("transform", "rotate(-90)");
      var healthcareLabel = yLabelsGroup.append("text")
          .attr("x", 0 - (chartHeight / 2))
          .attr("y", 40 - margin.left)
          .attr("dy", "1em")
          .attr("value", "healthcare")
          .classed("active", true)
          .text("Lacks Healthcare (%)");

      var smokesLabel = yLabelsGroup.append("text")
          .attr("x", 0 - (chartHeight / 2))
          .attr("y", 20 - margin.left)
          .attr("dy", "1em")
          .attr("value", "smokes")
          .classed("inactive", true)
          .text("Smokes (%)");

      var obeseLabel = yLabelsGroup.append("text")
          .attr("x", 0 - (chartHeight / 2))
          .attr("y", 0 - margin.left)
          .attr("dy", "1em")
          .attr("value", "obesity")
          .classed("inactive", true)
          .text("Obese (%)");

      // X labels event listener.
      xLabelsGroup.selectAll("text")
          .on("click", function () {
              // get value of selection
              chosenXAxis = d3.select(this).attr("value");
              // Update xLinearScale
              xLinearScale = xScale(censusData, chosenXAxis, chartWidth);
              // Render xAxis
              xAxis = renderXAxes(xLinearScale, xAxis);
              // Switch active/inactive labels.
              if (chosenXAxis === "poverty") {
                  povertyLabel
                      .classed("active", true)
                      .classed("inactive", false);
                  ageLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  incomeLabel
                      .classed("active", false)
                      .classed("inactive", true);
              } 
              else if (chosenXAxis === "age") {
                  povertyLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  ageLabel
                      .classed("active", true)
                      .classed("inactive", false);
                  incomeLabel
                      .classed("active", false)
                      .classed("inactive", true);
              } 
              else {
                  povertyLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  ageLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  incomeLabel
                      .classed("active", true)
                      .classed("inactive", false);
              }
              // Update circles with new x values.
              circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
              // Update tool tips with new info.
              circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
              // Update circles text with new values.
              circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          });
      // Y Labels event listener.
      yLabelsGroup.selectAll("text")
          .on("click", function () {
              // Grab selected label.
              chosenYAxis = d3.select(this).attr("value");
              // Update yLinearScale.
              yLinearScale = yScale(censusData, chosenYAxis, chartHeight);
              // Update yAxis.
              yAxis = renderYAxes(yLinearScale, yAxis);
              // Changes classes to change bold text.
              if (chosenYAxis === "healthcare") {
                  healthcareLabel
                      .classed("active", true)
                      .classed("inactive", false);
                  smokesLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  obeseLabel
                      .classed("active", false)
                      .classed("inactive", true);
              } 
              else if (chosenYAxis === "smokes") {
                  healthcareLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  smokesLabel
                      .classed("active", true)
                      .classed("inactive", false);
                  obeseLabel
                      .classed("active", false)
                      .classed("inactive", true);
              } 
              else {
                  healthcareLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  smokesLabel
                      .classed("active", false)
                      .classed("inactive", true);
                  obeseLabel
                      .classed("active", true)
                      .classed("inactive", false);
              }
              // Update circles with new y values.
              circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
              // Update tool tips with new info.
              circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circle, circleText);
              // Update circles text with new values.
              circleText = renderText(circleText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
              
          });
  }).catch(function (err) {
      console.log(err);
  });
}
makeResponsive();
// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);