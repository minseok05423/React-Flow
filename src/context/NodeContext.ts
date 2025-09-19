import { useContext, createContext } from "react";
import type { TreeNode } from "../types/tree";

export const nodeContext = createContext<{
  nodeInfo: TreeNode[];
  setNodeInfo: (info: TreeNode[]) => void;
} | null>(null);

export function useNodeContext() {
  const context = useContext(nodeContext);

  if (!context) {
    throw new Error("useNodeContext must be used with a nodeContext");
  }
  return context;
}
