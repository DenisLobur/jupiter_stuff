// Define the dimensions and margins of the visualization
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append the SVG element to the visualization div
const svg = d3.select("#visualization")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the data
d3.csv("tennis_games_data.csv").then(data => {
  // Data processing
  const winnersByYear = d3.group(data, d => d.year);
  const years = Array.from(winnersByYear.keys());
  const winnersData = years.map(year => {
    const winners = winnersByYear.get(year).map(d => d.winner);
    const winnersCount = {};
    winners.forEach(winner => {
      winnersCount[winner] = (winnersCount[winner] || 0) + 1;
    });
    return { year: year, winnersCount: winnersCount };
  });

  // Set up the scales
  const xScale = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(winnersData, d => d3.max(Object.values(d.winnersCount)))])
    .nice()
    .range([height, 0]);

  // Create color scale
  const colorScale = d3.scaleOrdinal()
    .domain(Object.keys(winnersData[0].winnersCount))
    .range(d3.schemeCategory10);

  // Create groups for each year
  const yearGroups = svg.selectAll(".year")
    .data(winnersData)
    .enter().append("g")
    .attr("class", "year")
    .attr("transform", d => `translate(${xScale(d.year)}, 0)`);

  // Create bars for each winner in each year
  yearGroups.selectAll(".bar")
    .data(d => Object.entries(d.winnersCount))
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale.bandwidth() / 4 * parseInt(d[0]))
    .attr("width", xScale.bandwidth() / 4)
    .attr("y", d => yScale(d[1]))
    .attr("height", d => height - yScale(d[1]))
    .style("fill", d => colorScale(d[0]));

  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  // Add y-axis
  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Add legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 60}, -10)`);

  legend.selectAll(".legend-item")
    .data(Object.keys(winnersData[0].winnersCount))
    .enter().append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`);

  legend.selectAll(".legend-item")
    .append("rect")
    .attr("x", 0)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", d => colorScale(d));

  legend.selectAll(".legend-item")
    .append("text")
    .attr("x", 15)
    .attr("y", 10)
    .attr("dy", "0.35em")
    .text(d => d);
});