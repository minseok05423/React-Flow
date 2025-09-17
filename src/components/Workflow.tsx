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
import { initialElements } from "./Flow/initialElements";
import SuggestionNode from "./Flow/SuggestionNode";
import RootNode from "./Flow/RootNode";
import TextNode from "./Flow/TextNode";
import DefaultNode from "./Flow/DefaultNode";
import FloatingEdge from "./Flow/FloatingEdge";
import FloatingConnectionLine from "./Flow/FloatingConnectionLine";

const nodeTypes = {
  rootNode: RootNode,
  suggestionNode: SuggestionNode,
  textNode: TextNode,
  defaultNode: DefaultNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

const { initialNodes, initialEdges } = initialElements();

function WorkflowContent() {
  const { addNodes, addEdges, deleteElements, updateNode, fitView } =
    useReactFlow();
  const [nodes, setNodes, defaultOnNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [suggestionSelectedNode, setSuggestionSelectedNode] =
    useState<Node | null>(null);

  const onNodesChange = useCallback(
    (changes: any[]) => {
      // Handle selection changes
      changes.forEach((change) => {
        if (change.type === "position") {
          updateNode(change.id, { position: change.position });
        }
        if (change.type === "select") {
          if (change.selected) {
            // Node was selected
            const node = nodes.find((n) => n.id === change.id);
            setSuggestionSelectedNode(node || null);
            console.log("Selected node:", node);
          } else {
            // Node was deselected
            setSuggestionSelectedNode(null);
            console.log("Node deselected");
          }
        }
      });

      // Apply default changes to update node state
      defaultOnNodesChange(changes);
    },
    [nodes, defaultOnNodesChange]
  );

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

  function AddNodeLayer(
    refNode: Node,
    nodeLayer: { value: string; type: string }[]
  ) {
    const lastNodePos = refNode.position;
    console.log(refNode);
    const width = refNode.measured?.width || 0;
    const height = refNode.measured?.height || 0;
    for (let i = 0; i < nodeLayer.length; i++) {
      const newNode = {
        id: `${refNode.id}-${i}`,
        position: {
          x: lastNodePos.x + width + 100,
          y:
            lastNodePos.y +
            height / 2 -
            (height * nodeLayer.length + 100 * (nodeLayer.length - 1)) / 2 +
            i * (height + 100),
        },
        data: { value: nodeLayer[i].value },
        type: `${nodeLayer[i].type}`,
      };
      const newEdge = {
        id: `${refNode.id}, ${refNode.id}-${i}`,
        source: `${refNode.id}`,
        target: `${refNode.id}-${i}`,
        type: "floating",
        animated: true,
      };
      addNodes(newNode);
      addEdges(newEdge);
    }
  }

  const sampleLayer = [
    { value: "a", type: "suggestionNode" },
    { value: "b", type: "suggestionNode" },
    { value: "c", type: "textNode" },
  ];
  const firstNode = nodes[0];

  function DeleteNode() {
    setNodes((prev) => {
      if (prev.length === 0) return prev;
      const newNodes = [...prev];
      newNodes.pop();
      return newNodes;
    });
  }

  useEffect(() => {
    if (suggestionSelectedNode) {
      nodes.map((node) => {
        if (node.type === "suggestionNode") {
          if (node.id !== suggestionSelectedNode.id) {
            deleteElements({ nodes: [{ id: `${node.id}` }] });
            console.log(node);
          } else {
            updateNode(node.id, { type: "defaultNode" });
          }
        }
      });
    }
  }, [suggestionSelectedNode]);

  useEffect(() => {
    fitView({ duration: 500 });
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
