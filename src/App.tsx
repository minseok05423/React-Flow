import { useState } from "react";
import Workflow from "./components/Workflow";
import { nodeContext } from "./context/NodeContext";
import type { TreeNode } from "./types/tree";

function App() {
  const [context, setContext] = useState<TreeNode[]>([]);

  return (
    <>
      <div>
        <nodeContext.Provider
          value={{
            nodeInfo: context,
            setNodeInfo: setContext,
          }}
        >
          <Workflow />
        </nodeContext.Provider>
      </div>
    </>
  );
}
// do not call functions immediately!!!

export default App;
