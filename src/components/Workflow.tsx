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
import useDeepseekAPI from "../hooks/useDeepseekAPI";
import Searchbar from "../components/SearchBar";
import type { TreeNode } from "../types/tree";

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
          x: lastNodePos.x + width + 200,
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

  const { CallDeepseek } = useDeepseekAPI();
  const [searchInput, setSearchInput] = useState("");
  const [context, setContext] = useState<TreeNode[]>([]);

  function GetContextPath(node: Node) {
    return node.id.split("-").map((a) => Number(a));
  }

  function GetContext(refNode: Node | null) {
    if (refNode) {
      let nodeContext: string[] = [];
      let path = GetContextPath(refNode);
      console.log(path);
      const p = (path: number[]) => {
        let currentContext: TreeNode[] | null = context;

        for (let i of path) {
          if (
            currentContext &&
            currentContext[i]
          ) {
            nodeContext.push(currentContext[i].value);
            currentContext = currentContext[i].children;
          }
        }
      };

      p(path);
      return nodeContext;
    }
  }
  // 0-1-2-3

  async function CreateLayer(refNode: Node) {
    let nodeLayer: { value: string; type: string }[] = [];
    const response = await CallDeepseek([searchInput]);
    console.log(response);

    const content = response.choices[0].message.content.split(", ");

    let path = GetContextPath(refNode);

    let currentNode = context[path[0]];
    for (let i = 1; i < path.length; i++) {
      currentNode = currentNode.children[path[i]];
    }

    setContext((prev) => {
      let newContext: TreeNode[] = [];

      for (let i = 0; i < content.length; i++) {
        prev.push({ value: content[i], children: null });
        nodeLayer.push({ value: content[i], type: "suggestionNode" });
      }
      const finalContext: TreeNode[] = [...prev];
      return prev;
    });

    AddNodeLayer(refNode, nodeLayer);
  }

  const CreateRoot = async () => {
    console.log(2);
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rootNode = {
      id: `${context.length}`,
      data: { value: `${searchInput}`, color: "#D9E9CF" },
      position: center,
      type: "rootNode",
    };

    setContext((prev) => [
      ...prev,
      { value: `${searchInput}`, children: null },
    ]);

    addNodes(rootNode);
    CreateLayer(rootNode);
  };

  //섹스
  useEffect(() => {
    console.log(context);
    const fin_context = GetContext(suggestionSelectedNode);
    console.log(suggestionSelectedNode);
    console.log(fin_context);
  }, [nodes.length, suggestionSelectedNode]);

  const FetchSuggestionData = async (refNode: Node) => {
    let nodeLayer: { value: string; type: string }[] = [];
    const response = await CallDeepseek([searchInput]);
    console.log(response);

    const content = response.choices[0].message.content.split(", ");
    setContext((prev) => {
      for (let i = 0; i < content.length; i++) {
        prev.push({ value: content[i], children: null });
        nodeLayer.push({ value: content[i], type: "suggestionNode" });
      }
      return prev;
    });

    AddNodeLayer(refNode, nodeLayer);
  };

  const HandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    CreateRoot();
    console.log(1);
    // you cannot immediately call an async function
  };

  return (
    <>
      <Searchbar
        HandleSubmit={HandleSubmit}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
      <div className="w-[1500px] h-[750px] border">
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
      <div></div>
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
