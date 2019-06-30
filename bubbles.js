let width = window.innerWidth;
let height = window.innerHeight;

// First load the data
d3.csv("./data.csv", nodeData => {
    console.log(nodeData);
    let data = computeCircleRadii(nodeData);
    // Get SVG element
    let svg = d3.select("#chart")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("transform", "translate(0, 0)")

    console.log("Created svg");

    // Create force simulation variable
    let force = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength([-300]))
        .force("x", d3.forceX(width / 2))
        .force("y", d3.forceY(height / 2));
    // .force("collide", d3.forceCollide());

    console.log("Created force");

    let tooltip = d3.select("#body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "coral")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("z-index", 2);

    let circles = svg.selectAll(".nodeBubble")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "nodeGroup")
        .append("circle")
        .attr("class", "nodeBubble")
        .attr("r", (d) => d.radius)
        .attr("fill", "lightblue")
    
    let texts = svg.selectAll(".nodeGroup")
            .append("text")
            .attr("text-anchor", "middle")
            .attr("font-family", 'DM Serif Text')
            .attr("fill", "white")
            .text((d) => d.importance);

    let nodeGroup = svg.selectAll(".nodeGroup")
    .on("mouseover", (d) => {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("left", (d3.mouse(d3.event.currentTarget)[0]-30) + "px")
            .style("top", (d3.mouse(d3.event.currentTarget)[1]+30) + "px")
            .text(d.Label)
    })
    .on("mousemove", (d) => {
        tooltip
            .style("left", (d3.mouse(d3.event.currentTarget)[0]-30) + "px")
            .style("top", (d3.mouse(d3.event.currentTarget)[1]+30) + "px")
    })
    .on("mouseout", (d) => {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    })
    
    // circles
    //     .append("title")
    //     .text((d) =>  d.Label)
    //     .style("font-size", 36)
        // .on("mouseover", (d) => {
        //     console.log(d);
        //     d3.select("#overlay")
        //         .style("opacity", 1)
        //         .style("z-index", 2)
        //         .append("h1")
        //         .text(d.Label)
        //     console.log("Moused!");
        // })
        // .on("mouseout", (d) => {
        //     console.log("Mouse out");
        //     d3.select("#overlay")
        //         .style("z-index", -1)
        //         .style("opacity", 0)
        //         .selectAll("h1")
        //         .remove();
        // })

    console.log("Created circles");

    force.nodes(data);

    force.on('tick', () => ticked(circles, texts));
});

// Helper functions
function computeCircleRadii (data) {
    // Create linear scale func to calculate radius
    let minImportance = d3.min(data, elem => +elem["eigencentrality"]);
    let maxImportance = d3.max(data, elem => +elem["eigencentrality"]);
    let scaleRadius = d3.scaleLinear()
                        .domain([minImportance, maxImportance])
                        .range([5, 50]);
    
    let descendingImportance = data.slice()
                                    .sort((a, b) => b.eigencentrality - a.eigencentrality);
    
    let updatedData = data.map(elem => {
        let radius = scaleRadius(elem["eigencentrality"]);
        let importance;
        descendingImportance.find((node, index) => { 
            if (node.Id == elem.Id) {
                importance = index + 1;
            }
        })
        // let importance = scaleImportance(elem["eigencentrality"]);
        return {...elem, radius, importance};
    });

    return updatedData;
}

// Execute on every tick
function ticked (circles, texts) {
    // Update cx, cy on each circle every tick
    circles.attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);

    texts.attr("dx", (d) => d.x)
            .attr("dy", (d) => d.y);
    
}
