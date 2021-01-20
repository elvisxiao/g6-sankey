
var data = {
  'nodes': [
    {id: "0"},
    {id: "1"},
    {id: "2"},
    {id: "3"},
  ],
  'links': [
    {source: 0, target: 1, value: 10},
    {source: 0, target: 2, value: 5},
    {source: 1, target: 3, value: 10},
    {source: 2, target: 3, value: 5},
  ]
};

var sankey = d3.sankey();
sankey.nodeId((d) => parseInt(d.id)); 
sankey.nodeWidth(80);
sankey.nodePadding(0); 
sankey.size([800, 500]);

const { nodes, links} = data;
const graphsankey = sankey({
    nodes,
    links,
})

G6.registerNode("node", {
  drawShape: function drawShape(cfg, group) {
    const {x, y, width, height, color, id} = cfg;
    
    console.log('add one node:', id, x, y, width, height);
    var rect = group.addShape("rect", {
      attrs: {
        x: 0,
        y: 0,
        width,
        height,
        stroke: color,
        fillOpacity: 1
      }
    });
    group.addShape('text', {
      attrs: {
        x: width / 2 - 3,
        y: height / 2  - 10,
        fill: '#333',
        text: id
      }
    });
    return rect;
  },

  getAnchorPoints: function getAnchorPoints() {
    return [[0, 0.5], [1, 0.5]];
  }
}, "single-shape");

G6.registerNode("sankey-edge", {
  drawShape: function drawShape(cfg, group) {
    const { startPoint0, endPoint0, startPoint1, endPoint1, label} = cfg;
    console.log('edge1', cfg);
    var path = group.addShape("path", {
      attrs: {
        path: [
          ['M', startPoint0.x, startPoint0.y], 
          ['L', endPoint0.x / 3 + 2 / 3 * endPoint0.x, startPoint0.y], 
          ['L', endPoint0.x / 3 + 2 / 3 * startPoint0.x, endPoint0.y], 
          ['L', endPoint0.x, endPoint0.y]
        ],
        stroke: 'red',
        fill: 'red',
        color: 'red',
        className: 'edge-shape'
      }
    });
    group.addShape('text', {
      attrs: {
        x: (endPoint0.x - startPoint0.x) / 2 - 7,
        y: 14,
        fill: 'red',
        text: label
      }
    });

    return path;
  },
}, "single-shape");

console.log('data:', data, sankey.links);

const graph = new G6.Graph({
  container: "container",
  width: 1000,
  height: 600,
  fitViewPadding: 0,
  pixelRatio: 1,
  layout: 'random',
  fitView: false,
  defaultNode: {
    color: "#5B8FF9",
    style: {
      fill: "#9EC9FF",
      lineWidth: 3
    },
    labelCfg: {
      style: {
        fill: "#fff",
        fontSize: 20
      }
    }

  },
  defaultEdge: {
    shape: "sankey-edge",
    style: {
      stroke: "#e2e2e2"
    }
  }
});

// const edges = data.links.map(link => {
//   link._source = link.source;
//   link._target = link.target;
//   link.source = link.source.id;
//   link.target = link.target.id;
  
//   return {...link, source: link.source };
// })

const cnodes = data.nodes.map(one => {
  one.shape = 'node';
  one.x = one.x1;
  one.y = one.y1;

  return {
    shape: 'node',
    id: one.id,
    // color: one.color,
    x: one.x0,
    y: one.y0,
    width: one.x1 - one.x0,
    height: one.y1 - one.y0,
  }
  return one;
});
graph.data({ nodes: cnodes });
graph.render();

const cedges = data.links.map(one => {
  one.shape = 'sankey-edge';
  const sourceNode = nodes.find(node => node.id === one.source.id);
  const targetNode = nodes.find(node => node.id === one.target.id);
  
  const beforeLinks = sourceNode.sourceLinks.filter(item => item.index < one.index);
  const y = [0, ...beforeLinks.map(one => one.width)].reduce((prev, curr) => prev + curr);
  const nodeWidth = sourceNode.x1 - sourceNode.x0;
  const x = sourceNode.x0 + nodeWidth / 2;
  return {
    shape: 'sankey-edge',
    x,
    y,
    startPoint0: {x, y},
    endPoint0: {x: targetNode.x0 - nodeWidth / 2, y: targetNode.y0},
    startPoint1: {x, y: y + one.width},
    endPoint1: {x: targetNode.x0, y:targetNode.y0 + one.width},
    weight: one.width,
    label: `${sourceNode.id} to ${targetNode.id}`,
  }
});
graph.addItem('node', cedges[0]);
graph.addItem('node', cedges[1]);
graph.addItem('node', cedges[2]);
graph.addItem('node', cedges[3]);

// cedges.forEach(edge =>  graph.addItem('node', edge))