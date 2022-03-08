var dataset;
var baseTemp;

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(response => response.json())
    .then((data) => {
        baseTemp = data.baseTemperature;
        dataset = data.monthlyVariance;

        var yearsFromDataSet = dataset.map((m) => m.year);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const w = 1500;
        const h = 600;
        const padding = 60;
        const barWidth = (w - 2 * padding) / (d3.max(yearsFromDataSet) - d3.min(yearsFromDataSet) + 1);
        const barHeight = (h - padding * 2) / 12

        // Define the div for the tooltip
        var div = d3.select("#d3Canvas").append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        const xScale = d3.scaleLinear()
            .domain([d3.min(yearsFromDataSet), d3.max(yearsFromDataSet)])
            .range([padding, w - padding]);

        const yScale = d3.scaleBand()
            .domain(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])
            .range([padding, h - padding]);

        const color = d3.scaleSequential()
            .interpolator(d3.interpolateRdYlBu)
            .domain([d3.max(dataset, (d) => d.variance + baseTemp), d3.min(dataset, (d) => d.variance + baseTemp)])

        const svg = d3.select("#d3Canvas")
            .append("svg")
            .attr('id', 'heat-map')
            .attr("width", w)
            .attr("height", h);

        svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("data-month", (d) => d.month - 1)
            .attr("data-year", (d) => d.year)
            .attr("data-temp", (d) => d.variance + baseTemp)
            .attr("data-variance", (d) => d.variance)
            .attr("x", (d) => xScale(d.year))
            .attr("y", (d) => yScale(months[d.month - 1]))
            .attr("width", barWidth)
            .attr("height", barHeight)
            .style('fill', (d) => color(d.variance + baseTemp))
            .on("mouseover", function (d) {
                var year = this.getAttribute('data-year');
                var month = this.getAttribute('data-month');
                var temp = parseInt(this.getAttribute('data-temp')).toFixed(2);
                var variance = parseInt(this.getAttribute('data-variance')).toFixed(2);

                var coordinates = d3.pointer(d);
                var x = coordinates[0] + padding;
                var y = coordinates[1] + document.getElementById('heat-map').getBoundingClientRect().y - padding;

                div.attr('data-year', year);
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(year + ' - ' + months[month] + "<br/>" + temp + '°C' + "<br/>" + variance + '°C')
                    .style("left", x + "px")
                    .style("top", y + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Create Axises
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
        const yAxis = d3.axisLeft(yScale);



        // Append X Axis
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis);

        // Append Y Axis
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);



        const colorDom = color.domain();
        const increase = (d3.max(colorDom) - d3.min(colorDom)) / 4;
        var colors = []

        for (var i = 0; i < 5; i++) {
            colors.push(parseFloat(i * increase + d3.min(colorDom)).toFixed(3))
        }

        console.log(colors)

        var legendWidth = 200;
        var legendHeight = 50;
        var legendPadding = 20;

        var legendRectWidth = (legendWidth) / colors.length

        const legend = d3.select("#d3Canvas")
            .append("svg")
            .attr('id', 'legend')
            .attr('width', legendWidth)
            .attr('height', legendHeight);

        legend
            .selectAll('rect')
            .data(colors)
            .enter()
            .append('rect')
            .attr('x', (d, i) => i * legendRectWidth)
            .attr('y', 0)
            .attr('width', legendRectWidth)
            .attr('height', legendHeight - legendPadding)
            .attr('fill', (d) => color(d))

        const legendScale = d3.scaleBand()
            .domain(colors)
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale);

        legend.append("g")
            .attr("id", "legend-x-axis")
            .attr("transform", "translate(0," + (legendHeight - 20) + ")")
            .call(legendAxis);
    });