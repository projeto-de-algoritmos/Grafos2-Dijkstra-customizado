import React, { useState } from 'react';
import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';
import Draggable from 'react-draggable';

var PriorityQueue = require('js-priority-queue')

const boxStyle = { border: 'grey solid 2px', borderRadius: 100, margin: '15px', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' };

const DraggableBox = ({ id, visited, startPosition }) => {
  const updateXarrow = useXarrow();
  return (
    <Draggable defaultPosition={startPosition} style={{ margin: 15 }} onDrag={updateXarrow} onStop={updateXarrow}>
      <div id={id} style={{ ...boxStyle, backgroundColor: visited ? 'red' : null }}>
        {id}
      </div>
    </Draggable>
  );
};

const App = () => {
  const [edges, setEdges] = useState({
    '1': [
      { end: '2', size: 9 }, { end: '7', size: 15 }, { end: '6', size: 14 }
    ],
    '2': [{ end: '3', size: 23 }],
    '3': [{ end: '5', size: 2 }, { end: '8', size: 19 }],
    '4': [{ end: '3', size: 6 }, { end: '8', size: 6 }],
    '5': [{ end: '4', size: 11 }, { end: '8', size: 16 }],
    '6': [{ end: '5', size: 30 }, { end: '7', size: 5 }, { end: '3', size: 18 }],
    '7': [{ end: '5', size: 30 }, { end: '8', size: 44 }],
  });
  const [nodes, setNodes] = useState({ 
    '1': { visited: false, startPosition: { x: 0, y: 0 } }, 
    '2': { visited: false, startPosition: { x: 600, y: -120 } }, 
    '3': { visited: false, startPosition: { x: 1370, y: -240 } }, 
    '4': { visited: false, startPosition: { x: 1050, y: -100 } }, 
    '5': { visited: false, startPosition: { x: 550, y: -200 } }, 
    '6': { visited: false, startPosition: { x: 250, y: -450 } }, 
    '7': { visited: false, startPosition: { x: 0, y: -200 } }, 
    '8': { visited: false, startPosition: { x: 1200, y: -300 } } 
  });
  const [start, setStart] = useState('1');
  const [end, setEnd] = useState('2');
  const [startNode, setStartNode] = useState('1');
  const [endNode, setEndNode] = useState('2');
  const [size, setSize] = useState(1);
  const [total, setTotal] = useState(0);
  const [path, setPath] = useState([]);

  const startDjikstra = () => {
    const queueList = new PriorityQueue({ comparator: (a, b) => { return a[0] - b[0] } });
    const auxMap = new Map();
    const definitiveMap = new Map();
    let currentNode = startNode;
    definitiveMap.set(currentNode, [0, 0]);
    let refNode = nodes[startNode];
    refNode.visited = true;
    setNodes(prev => ({ ...prev, [startNode]: refNode }));
    do {
      edges[currentNode]?.forEach(edge => {
        let currentWeight = edge.size + definitiveMap.get(currentNode)[0];
        
        if (!(auxMap.has(edge.end) && currentWeight >= auxMap.get(edge.end)[0]) && !definitiveMap.has(edge.end)) {
          queueList.queue([currentWeight, edge.end, currentNode]);
          auxMap.set(edge.end, [currentWeight, currentNode]);
        };
      });
      if(!queueList.length) break;
      let nextStep = queueList.dequeue();
      while(queueList.length && definitiveMap.has(nextStep[1])) {
        nextStep = queueList.dequeue();
      }
      
      definitiveMap.set(nextStep[1], [nextStep[0], nextStep[2]]);
      currentNode = nextStep[1];
      let refNode = nodes[currentNode];
      refNode.visited = true;
      setNodes(prev => ({ ...prev, [currentNode]: refNode }));
    } while (!nodes[endNode].visited);
    setTotal(definitiveMap.get(endNode)[0]);
    setPath(() => {
      let newPath = [];
      let aux = endNode;
      while(aux !== startNode) {
        const pathStart = definitiveMap.get(aux)[1];
        newPath = [ {end: aux, start: pathStart}, ...newPath];
        aux = pathStart;
      }
      return newPath;
    })
  };
  return (
    <div>
      <header style={{
        display: 'flex',
        margin: '10px 0 0 10px',
        width: '70vw',
        justifyContent: 'space-between'
      }}>
        {/*<button onClick={() => setNodes(prev => ({ ...prev, [`${Object.keys(nodes).length + 1}`]: { visited: false, startPosition: { x: 10, y: 10 }} }))}>adicionar nó </button>*/}
        <section style={{ width: '50%', display: 'flex', justifyContent: 'space-around' }}>
          inicio:
          <select name="inicio" onChange={e => setStart(e.target.value)} value={start}>
            {Object.keys(nodes).map(node => <option value={node}>{node}</option>)}
          </select>
          fim:
          <select name="fim" onChange={e => setEnd(e.target.value)} value={end}>
            {Object.keys(nodes).map(node => <option value={node}>{node}</option>)}
          </select>
          peso:
          <input style={{ width: '50px' }} type="number" onChange={e => setSize(e.target.value)} value={size} />
          <button onClick={() => {
            const newEdges = edges[start] || [];
            newEdges.push({ end, size });
            setEdges(prev => ({ ...prev, [start]: newEdges }));
          }}>adicionar ligação </button>
        </section>
        <section style={{ width: '30%', display: 'flex', justifyContent: 'space-around' }}>
          nó inicial:
          <select name="inicioNode" onChange={e => setStartNode(e.target.value)} value={startNode}>
            {Object.keys(nodes).map(node => <option value={node}>{node}</option>)}
          </select>
          nó final:
          <select name="fimNode" onChange={e => setEndNode(e.target.value)} value={endNode}>
            {Object.keys(nodes).map(node => <option value={node}>{node}</option>)}
          </select>
          <button onClick={startDjikstra}>iniciar </button>
        </section>
        <section style={{ width: '40%' }}>
        <span> total : {total} </span>
        caminho: {path.map(p => (<span>{` ${p.start} -> ${p.end} |`}</span>))}
        </section>
      </header>
      <Xwrapper>
        {Object.entries(nodes).map(([key, value]) => <DraggableBox id={key} {...value} />)}
        {Object.entries(edges).map(([key, value]) => value.map((edge) => (
          <Xarrow labels={{ middle: (<div style={{ margin: '0 0 20px 20px' }}>{edge.size}</div>) }} start={key} end={edge.end} />
        )))}
      </Xwrapper>
    </div>
  );
}

export default App;