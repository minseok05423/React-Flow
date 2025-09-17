import { useState } from "react";
import useDeepseekAPI from "./hooks/useDeepseekAPI";
import Searchbar from "./components/SearchBar";
import Workflow from "./components/Workflow";
import { nodeContext } from "./context/NodeContext";

function App() {
  const { CallDeepseek } = useDeepseekAPI();
  const [searchInput, setSearchInput] = useState("");
  const [context, setContext] = useState({ nodeInfo: {} });
  const [deepseekResponse, setDeepseekResponse] = useState();

  const HandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newContext = [...context, searchInput];
    setContext(newContext);

    const FetchData = async () => {
      const response = await CallDeepseek(newContext);
      console.log(response);

      const content = response.choices[0].message.content.split(", ");
      setDeepseekResponse(content);
    };
    FetchData();
    // you cannot immediately call an async function
  };

  return (
    <>
      <Searchbar
        HandleSubmit={HandleSubmit}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
      {deepseekResponse && <div>{deepseekResponse}</div>}
      <div>
        <nodeContext.Provider
          value={{
            nodeInfo: context.nodeInfo,
            setNodeInfo: (info) => setContext({ nodeInfo: info }),
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
