import React, { useState } from "react";

/* ---------- CONSTANTS ---------- */
const ROWS = 20;
const COLS = 20;

const START_ROW = 5;
const START_COL = 5;
const END_ROW = 15;
const END_COL = 15;

/* ---------- MAIN COMPONENT ---------- */
function App() {
  const [grid, setGrid] = useState(createGrid());
  const [mousePressed, setMousePressed] = useState(false);

  /* ---------- MOUSE HANDLERS ---------- */
  function handleMouseDown(row, col) {
    const newGrid = toggleWall(grid, row, col);
    setGrid(newGrid);
    setMousePressed(true);
  }

  function handleMouseEnter(row, col) {
    if (!mousePressed) return;
    const newGrid = toggleWall(grid, row, col);
    setGrid(newGrid);
  }

  function handleMouseUp() {
    setMousePressed(false);
  }

  /* ---------- CLEAR FUNCTIONS ---------- */
  function clearGrid() {
    setGrid(createGrid());
  }

  function clearPath() {
    const newGrid = grid.map(row =>
      row.map(node => ({
        ...node,
        isVisited: false,
        previousNode: null,
        distance: Infinity,
      }))
    );
    setGrid(newGrid);

    newGrid.forEach(row =>
      row.forEach(node => {
        const el = document.getElementById(
          `node-${node.row}-${node.col}`
        );
        if (
          el &&
          !node.isStart &&
          !node.isEnd &&
          !node.isWall
        ) {
          el.style.backgroundColor = "white";
        }
      })
    );
  }

  /* ---------- BFS ---------- */
  function visualizeBFS() {
    clearPath();

    const start = grid[START_ROW][START_COL];
    const end = grid[END_ROW][END_COL];

    const visited = bfs(grid, start, end);
    const path = getShortestPath(end);

    animate(visited, path);
  }

  /* ---------- DIJKSTRA ---------- */
  function visualizeDijkstra() {
    clearPath();

    const start = grid[START_ROW][START_COL];
    const end = grid[END_ROW][END_COL];

    const visited = dijkstra(grid, start, end);
    const path = getShortestPath(end);

    animate(visited, path);
  }

  /* ---------- ANIMATION ---------- */
  function animate(visited, path) {
    for (let i = 0; i <= visited.length; i++) {
      if (i === visited.length) {
        setTimeout(() => animatePath(path), 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visited[i];
        if (!node.isStart && !node.isEnd) {
          document.getElementById(
            `node-${node.row}-${node.col}`
          ).style.backgroundColor = "#90caf9";
        }
      }, 10 * i);
    }
  }

  function animatePath(path) {
    for (let i = 0; i < path.length; i++) {
      setTimeout(() => {
        const node = path[i];
        if (!node.isStart && !node.isEnd) {
          document.getElementById(
            `node-${node.row}-${node.col}`
          ).style.backgroundColor = "yellow";
        }
      }, 50 * i);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div
      style={{
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "Arial",
      padding: "20px",
    }}
    >
      <h1>Pathfinding Visualizer</h1>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={visualizeBFS}>BFS</button>
        <button onClick={visualizeDijkstra} style={{ marginLeft: 5 }}>
          Dijkstra
        </button>
        <button onClick={clearPath} style={{ marginLeft: 5 }}>
          Clear Path
        </button>
        <button onClick={clearGrid} style={{ marginLeft: 5 }}>
          Clear Grid
        </button>
      </div>

      <div onMouseUp={handleMouseUp}>
        {grid.map((row, rIdx) => (
          <div key={rIdx} style={{ display: "flex" }}>
            {row.map((node, nIdx) => (
              <div
                key={nIdx}
                id={`node-${node.row}-${node.col}`}
                onMouseDown={() =>
                  handleMouseDown(node.row, node.col)
                }
                onMouseEnter={() =>
                  handleMouseEnter(node.row, node.col)
                }
                style={{
                  width: "25px",
                  height: "25px",
                  minWidth: "25px",
                  minHeight: "25px",
                  border: "1px solid black",
                  display: "inline-block",
                  backgroundColor: node.isStart
                    ? "green"
                    : node.isEnd
                    ? "red"
                    : node.isWall
                    ? "black"
                    : "#f5f5f5",
                }}
                
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- HELPER FUNCTIONS ---------- */

function createGrid() {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(createNode(r, c));
    }
    grid.push(row);
  }
  return grid;
}

function createNode(row, col) {
  return {
    row,
    col,
    isStart: row === START_ROW && col === START_COL,
    isEnd: row === END_ROW && col === END_COL,
    isWall: false,
    isVisited: false,
    distance: Infinity,
    previousNode: null,
  };
}

function toggleWall(grid, row, col) {
  const newGrid = grid.map(r => r.map(n => ({ ...n })));
  const node = newGrid[row][col];

  if (node.isStart || node.isEnd) return newGrid;

  node.isWall = !node.isWall;
  return newGrid;
}

/* ---------- BFS LOGIC ---------- */
function bfs(grid, start, end) {
  const visited = [];
  const queue = [];

  start.isVisited = true;
  queue.push(start);

  while (queue.length) {
    const node = queue.shift();
    if (node.isWall) continue;

    visited.push(node);
    if (node === end) return visited;

    getNeighbors(node, grid).forEach(n => {
      if (!n.isVisited) {
        n.isVisited = true;
        n.previousNode = node;
        queue.push(n);
      }
    });
  }
  return visited;
}

/* ---------- DIJKSTRA LOGIC ---------- */
function dijkstra(grid, start, end) {
  const visited = [];
  start.distance = 0;

  const unvisited = [];
  grid.forEach(r => r.forEach(n => unvisited.push(n)));

  while (unvisited.length) {
    unvisited.sort((a, b) => a.distance - b.distance);
    const closest = unvisited.shift();

    if (closest.isWall) continue;
    if (closest.distance === Infinity) break;

    closest.isVisited = true;
    visited.push(closest);
    if (closest === end) return visited;

    getNeighbors(closest, grid).forEach(n => {
      const dist = closest.distance + 1;
      if (dist < n.distance) {
        n.distance = dist;
        n.previousNode = closest;
      }
    });
  }
  return visited;
}

function getNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < COLS - 1) neighbors.push(grid[row][col + 1]);

  return neighbors;
}

function getShortestPath(end) {
  const path = [];
  let current = end;

  while (current) {
    path.unshift(current);
    current = current.previousNode;
  }
  return path;
}

export default App;
