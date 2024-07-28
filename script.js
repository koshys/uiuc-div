const margin = { top: 60, right: 30, bottom: 50, left: 60 };
let width = document.getElementById('visualization').clientWidth - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

const color = d3.scaleOrdinal(d3.schemeCategory10);

const scenes = {
    1: createOverviewScene,
    2: createSepalComparisonScene,
    3: createPetalComparisonScene,
    4: createSepalPetalScatterPlotScene,
    5: createSepalLengthBarChartScene
};

let currentScene = 1;
let data;

d3.csv("https://raw.githubusercontent.com/uiuc-cse/data-fa14/gh-pages/data/iris.csv").then(loadedData => {
    data = loadedData.map(d => ({
        ...d,
        sepal_length: +d.sepal_length,
        sepal_width: +d.sepal_width,
        petal_length: +d.petal_length,
        petal_width: +d.petal_width
    }));
    updateScene(currentScene);
});

document.getElementById("nextButton").addEventListener("click", () => {
    currentScene = (currentScene % 5) + 1;
    updateScene(currentScene);
});

document.getElementById("previousButton").addEventListener("click", () => {
    currentScene = (currentScene - 2 + 5) % 5 + 1;
    updateScene(currentScene);
});

window.addEventListener("resize", () => {
    width = document.getElementById('visualization').clientWidth - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    updateScene(currentScene);
});

function updateScene(sceneNumber) {
    svg.selectAll("*").remove();
    scenes[sceneNumber]();
}

function createSceneTitle(title) {
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .text(title);
}

function createOverviewScene() {
    createSceneTitle("Iris Dataset Overview");

    const textGroup = svg.append("g");

    const foreignObject = textGroup.append("foreignObject")
        .attr("x", width / 2 - (width - 40) / 2)
        .attr("y", height / 2)
        .attr("width", width - 40)
        .attr("height", height - (height / 2))
        .append("xhtml:div")
        .style("font-size", "16px")
        .style("color", "gray")
        .html(`This visualization presents an overview of the Iris dataset, which includes measurements of sepal length, sepal width, petal length, and petal width for different species of Iris flowers. Navigate through the scenes to explore the relationships between these features. The dataset is available <a href="https://raw.githubusercontent.com/uiuc-cse/data-fa14/gh-pages/data/iris.csv" target="_blank">here</a>.`);
}

function wrapText(text, width) {
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const y = text.attr("y");
    const x = text.attr("x");
    const dy = 0; // + lineHeight;
    let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", `${dy}em`);

    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", `${++lineNumber * lineHeight}em`).text(word);
        }
    }
}

function createSepalComparisonScene() {
    createSceneTitle("Sepal Length vs Width");

    const x = d3.scaleLinear().domain([4, 8]).range([0, width]);
    const y = d3.scaleLinear().domain([2, 4.5]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.sepal_length))
        .attr("cy", d => y(d.sepal_width))
        .attr("r", 5)
        .style("fill", d => color(d.species))
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Species: ${d.species}<br>Sepal Length: ${d.sepal_length}<br>Sepal Width: ${d.sepal_width}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Sepal Length");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Sepal Width");

    const annotations = [
        {
            note: { label: "Long Sepals", title: "Sepal Length vs Width" },
            x: x(7.5),
            y: y(3.8),
            dy: -30,
            dx: -30
        }
    ];

    const makeAnnotations = d3.annotation()
        .type(d3.annotationCallout)
        .annotations(annotations);
    svg.append("g").call(makeAnnotations);
}

function createPetalComparisonScene() {
    createSceneTitle("Petal Length vs Width");

    const x = d3.scaleLinear().domain([1, 7]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 2.5]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.petal_length))
        .attr("cy", d => y(d.petal_width))
        .attr("r", 5)
        .style("fill", d => color(d.species))
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Species: ${d.species}<br>Petal Length: ${d.petal_length}<br>Petal Width: ${d.petal_width}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Petal Length");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Petal Width");

    const annotations = [
        {
            note: { label: "Wide Petals", title: "Petal Length vs Width" },
            x: x(5.5),
            y: y(2),
            dy: -30,
            dx: -100
        }
    ];

    const makeAnnotations = d3.annotation()
        .type(d3.annotationCallout)
        .annotations(annotations);
    svg.append("g").call(makeAnnotations);
}

function createSepalPetalScatterPlotScene() {
    createSceneTitle("Sepal Length vs Petal Length");

    const x = d3.scaleLinear().domain([4, 8]).range([0, width]);
    const y = d3.scaleLinear().domain([1, 7]).range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.sepal_length))
        .attr("cy", d => y(d.petal_length))
        .attr("r", 5)
        .style("fill", d => color(d.species))
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Species: ${d.species}<br>Sepal Length: ${d.sepal_length}<br>Petal Length: ${d.petal_length}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Sepal Length");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Petal Length");

    const annotations = [
        {
            note: { label: "High correlation", title: "Sepal vs Petal Length" },
            x: x(6.5),
            y: y(5),
            dy: -30,
            dx: -150
        }
    ];

    const makeAnnotations = d3.annotation()
        .type(d3.annotationCallout)
        .annotations(annotations);
    svg.append("g").call(makeAnnotations);
}

function createSepalLengthBarChartScene() {
    createSceneTitle("Average Sepal Length by Species");

    const species = Array.from(new Set(data.map(d => d.species)));
    const avgSepalLength = species.map(species => ({
        species,
        avgSepalLength: d3.mean(data.filter(d => d.species === species), d => d.sepal_length)
    }));

    const x = d3.scaleBand()
        .domain(species)
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(avgSepalLength, d => d.avgSepalLength)])
        .range([height, 0]);

    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    svg.selectAll("rect")
        .data(avgSepalLength)
        .enter().append("rect")
        .attr("x", d => x(d.species))
        .attr("y", d => y(d.avgSepalLength))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.avgSepalLength))
        .attr("fill", d => color(d.species))
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Species: ${d.species}<br>Avg Sepal Length: ${d.avgSepalLength.toFixed(2)}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Species");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Avg Sepal Length");

    const annotations = [
        {
            note: { label: "Species with Long Sepals", title: "Average Sepal Length" },
            x: x(species[2]) + x.bandwidth() / 2,
            y: y(avgSepalLength[2].avgSepalLength),
            dy: -30,
            dx: 30
        }
    ];

    const makeAnnotations = d3.annotation()
        .type(d3.annotationCallout)
        .annotations(annotations);
    svg.append("g").call(makeAnnotations);
}
