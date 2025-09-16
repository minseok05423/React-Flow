import { useState, useRef, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  BaseEdge,
  type OnConnect,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { initialNodes, initialEdges } from "./WorkflowConstants";
import TestNode from "./TestNode";

const nodeTypes = {
  testNode: TestNode,
};

function WorkflowContent() {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  function AddNode() {
    let lastNodePos = { x: 0, y: 0 };
    let newPos = { x: 0, y: 0 };
    setNodes((prev) => {
      lastNodePos = prev[prev.length - 1]?.position;
      console.log(lastNodePos);
      newPos = { ...lastNodePos, x: lastNodePos.x + 200 };
      const newNode = {
        id: `${prev.length + 1}`,
        position: newPos,
        data: { value: "test node", color: "#D9E9CF" },
        type: "testNode", 
      };
      return [...prev, newNode];                      
    });
  }

  function DeleteNode() {
    setNodes((prev) => {
      if (prev.length === 0) return prev;
      const newNodes = [...prev];
      newNodes.pop();
      return newNodes;
    });
  }

  useEffect(() => {
    fitView();
  }, [nodes, edges]);

  return (
    <>
      <div className="w-[750px] h-[750px] border">
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
        <button className="border" onClick={AddNode}>
          add node
        </button>
        <br />
        <button className="border" onClick={DeleteNode}>
          delete node
        </button>
      </div>
    </>
  );
}

function Workflow() {
  return (
    <ReactFlowProvider>
      <WorkflowContent />
    </ReactFlowProvider>
  );
}

export default Workflow;
