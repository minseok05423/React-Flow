import { useState } from "react";

const DeepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

const useDeepseekAPI = () => {
  const [deepseekError, setDeepseekError] = useState<string | null>(null);
  const [deepseekLoading, setDeepseekLoading] = useState<boolean>(false);

  const CallDeepseek = async (context: string[] = []) => {
    // add default value for fallback
    setDeepseekError(null);
    setDeepseekLoading(true);

    try {
      const response = await fetch(
        "https://api.deepseek.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DeepseekApiKey}`,
            "Content-Type": "application/json",
            // tells the server that the data is in json
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "Generate 5 deeper, more specific keywords about the target topic. Avoid repeating any words from the context. Output only keywords separated by commas.",
              },
              {
                role: "user",
                content: `Context words to avoid: ${context
                  .slice(0, -1)
                  .join(", ")}. Generate deeper keywords for: ${
                  context[context.length - 1]
                }`,
              },
            ],
            model: "deepseek-chat",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Deepseek API error: ${response.status}`);
      }
      const completion = await response.json();
      // .json() needs await as it is asynchronous
      return completion;
    } catch (error) {
      const message =
        error instanceof Error ? error : "unknown error has occured";
      console.log(message);
    }
  };

  return { CallDeepseek, deepseekError, deepseekLoading };
};

export default useDeepseekAPI;
