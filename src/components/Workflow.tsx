import { useState, useRef, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
} from "@xyflow/react";
import type { Node, Edge, OnConnect } from "@xyflow/react";
import { initialElements } from "./initialElements";
import TestNode from "./TestNode";
import RootNode from "./RootNode";
import FloatingEdge from "./FloatingEdge";
import FloatingConnectionLine from "./FloatingConnectionLine";

const nodeTypes = {
  rootNode: RootNode,
  testNode: TestNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

const { initialNodes, initialEdges } = initialElements();

function WorkflowContent() {
  const { addNodes, fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "floating",
            markerEnd: { type: MarkerType.Arrow },
          },
          eds
        )
      ),
    [setEdges]
  );

  function AddNodeLayer(refNode: Node, nodeLayer: { value: string }[]) {
    const lastNodePos = refNode.position;
    const width = refNode.measured?.width || 0;
    const height = refNode.measured?.height || 0;
    for (let i = 0; i < nodeLayer.length; i++) {
      const newNode = {
        id: `${refNode.id}-${i}`,
        position: {
          x: lastNodePos.x + width + 200,
          y:
            lastNodePos.y -
            (height * nodeLayer.length + 100 * (nodeLayer.length - 1)) / 2 +
            i * (height + 100),
        },
        data: { value: nodeLayer[i].value, color: "#D9E9CF" },
        type: "testNode",
      };
      addNodes(newNode);
    }
  }

  const sampleLayer = [{ value: "a" }, { value: "b" }, { value: "c" }];
  const firstNode = initialNodes[0];

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
  }, [nodes.length]);

  return (
    <>
      <div className="w-[750px] h-[750px] border">
        <ReactFlow
          className=""
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={FloatingConnectionLine}
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
        <button
          className="border"
          onClick={() => AddNodeLayer(firstNode, sampleLayer)}
        >
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

// ReactFlowProvider acts as a context provider

export default Workflow;
