const dims = { height: 500, width: 1100 };

const svg = d3.select('.canvas')
    .append('svg')
    .attr('height', dims.height + 100)
    .attr('width', dims.width + 100);

const graph = svg.append('g')
    .attr('transform', "translate(-60, 50)");

// data stratification
const stratify = d3.stratify()
    .id(d => d.name)
    .parentId(d => d.parent);

const tree = d3.tree()
    .size([dims.width, dims.height]);

// create ordinal scale
const color = d3.scaleOrdinal(d3["schemeSet2"]);

// update function
const update = (data) => {
    // remove current nodes
    graph.selectAll('.node').remove();
    graph.selectAll('.link').remove();

    // update ordinal scale domain
    color.domain(data.map(d => d.department));

    // get updated root node data
    const rootNode = stratify(data);
    const treeData = tree(rootNode);

    // get nodes selection and join data
    const nodes = graph.selectAll('.node')
        .data(treeData.descendants());

    // get link selection and join data
    const links = graph.selectAll('.link')
        .data(treeData.links());

    // enter new links
    links.enter()
        .append('path')
        .attr('class', 'link')
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 2)
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        );

    // create enter node groups
    const enterNodes = nodes.enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // append rects to enter nodes
    enterNodes.append('rect')
        .attr("fill", d => color(d.data.department))
        .attr("stroke", "#555")
        .attr("stroke-width", 2)
        .attr("width", d => d.data.name.length * 20)
        .attr("height", 50)
        .attr("transform", d => {
            var x = d.data.name.length * 10;
            return `translate(${-x}, -25)`;
        });

    // append name text
    enterNodes.append('text')
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(d => d.data.name);
}

// data & firebase hook-up
var data = [];

db.collection('employees').onSnapshot(res => {

  res.docChanges().forEach(change => {

    const doc = {...change.doc.data(), id: change.doc.id};

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }

  });

  update(data);

});