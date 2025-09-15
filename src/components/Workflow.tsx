import { useState, useRef, useCallback } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  BaseEdge,
  type OnConnect,
  Controls,
} from "@xyflow/react";
import { initialNodes, initialEdges } from "./WorkflowConstants";
import TestNode from "./TestNode";

const nodeTypes = {
  testNode: TestNode,
};

function Workflow() {
  const [currPosition, setCurrPosition] = useState(200);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  function HandleClick() {
    setNodes((prev) => {
      console.log(currPosition);
      const newNode = {
        id: `${prev.length + 1}`,
        position: { x: currPosition, y: 0 },
        data: { value: "test node", color: "#D9E9CF" },
        type: "testNode",
      };
      return [...prev, newNode];
    });
    setCurrPosition((prev) => prev + 200);
  }

  return (
    <>
      <div className="w-[500px] h-[500px]">
        <ReactFlow
          className=""
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      <div>
        <button onClick={HandleClick}>add node</button>
      </div>
    </>
  );
}

export default Workflow;
