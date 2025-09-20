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
import { useNodeContext } from "../context/NodeContext";

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
  const { addNodes, addEdges, deleteElements, updateNode, getNode, fitView } =
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
    // Get fresh node data from current nodes state
    const currentNode = getNode(refNode.id);
    const lastNodePos = currentNode?.position || refNode.position;
    const width = currentNode?.measured?.width || refNode.measured?.width || 0;
    const height =
      currentNode?.measured?.height || refNode.measured?.height || 0;

    console.log("Fresh position:", lastNodePos);
    console.log("Fresh measurements:", { width, height });
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
  const { nodeInfo: context, setNodeInfo: setContext } = useNodeContext();

  function GetContextPath(node: Node) {
    return node.id.split("-").map((a) => Number(a));
  }

  function GetContext(refNode: Node | null) {
    if (refNode) {
      let nodeContext: string[] = [];
      let path = GetContextPath(refNode);
      const PushContext = (path: number[]) => {
        let currentContext: TreeNode[] = context;
        console.log(context);

        for (let i of path) {
          console.log(i, currentContext);
          if (currentContext && currentContext[i]) {
            nodeContext.push(currentContext[i].value);
            currentContext = currentContext[i].children;
          }
        }
      };

      PushContext(path);
      return nodeContext;
    }
  }
  // 0-1-2-3

  useEffect(() => {
    console.log(GetContext(suggestionSelectedNode));
  }, [suggestionSelectedNode]);

  useEffect(() => {
    console.log(context);
  }, [context]);

  useEffect(() => {
    if (suggestionSelectedNode) {
      CreateLayer(suggestionSelectedNode);
    }
  }, [suggestionSelectedNode]);

  async function CreateLayer(refNode: Node) {
    const response = await CallDeepseek(GetContext(suggestionSelectedNode));
    console.log(response);

    const content = response.choices[0].message.content.split(", ");

    let nodeLayer: { value: string; type: string }[] = [];
    let childrenLayer: TreeNode[] = [];
    for (let i = 0; i < content.length; i++) {
      nodeLayer.push({ value: content[i], type: "suggestionNode" });
      childrenLayer.push({ value: content[i], children: [] });
    }
    AddNodeLayer(refNode, nodeLayer);

    const path = GetContextPath(refNode);
    const newContext = AddChildrenToPath(context, path, childrenLayer);

    setContext(newContext);
  }

  async function CreateLayerWithContext(
    refNode: Node,
    currentContext: TreeNode[]
  ) {
    const response = await CallDeepseek([searchInput]);
    console.log(response);

    const content = response.choices[0].message.content.split(", ");

    let nodeLayer: { value: string; type: string }[] = [];
    let childrenLayer: TreeNode[] = [];
    for (let i = 0; i < content.length; i++) {
      nodeLayer.push({ value: content[i], type: "suggestionNode" });
      childrenLayer.push({ value: content[i], children: [] });
    }
    AddNodeLayer(refNode, nodeLayer);

    const path = GetContextPath(refNode);
    const newContext = AddChildrenToPath(currentContext, path, childrenLayer);

    setContext(newContext);
  }

  function AddChildrenToPath(
    tree: TreeNode[],
    path: number[],
    newChildren: TreeNode[]
  ): TreeNode[] {
    if (path.length === 0) {
      // Adding to root level
      return [...tree, ...newChildren];
    }

    return tree.map((node, index) => {
      if (index === path[0] && node.children) {
        if (path.length === 1) {
          // This is the target node, add children
          return {
            ...node,
            children: [...node.children, ...newChildren],
          };
        } else {
          // Recurse deeper
          return {
            ...node,
            children: AddChildrenToPath(
              node.children,
              path.slice(1),
              newChildren
            ),
          };
        }
      }
      return node;
    });
  }

  const CreateRoot = async () => {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const rootNode = {
      id: `${context.length}`,
      data: { value: `${searchInput}`, color: "#D9E9CF" },
      position: center,
      type: "rootNode",
    };

    const newContext = [...context, { value: `${searchInput}`, children: [] }];
    setContext(newContext);

    addNodes(rootNode);
    CreateLayerWithContext(rootNode, newContext);
  };

  const HandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    CreateRoot();
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
