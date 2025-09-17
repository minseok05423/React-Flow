import { useContext, createContext } from "react";

export const nodeContext = createContext<{
  nodeInfo: {};
  setNodeInfo: (info: {}) => void;
} | null>(null);

export function useNodeContext() {
  const context = useContext(nodeContext);

  if (!context) {
    throw new Error("useNodeContext must be used with a nodeContext");
  }
  return context;
}
