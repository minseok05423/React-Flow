import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import Cancel from "../../assets/cancel.svg?react";
import { useState } from "react";

type TextNode = Node<{ value: string; color: string }, "custom">;

export default function TextNode({
  id,
  data: { color = "#F0F0F0" },
  selected,
}: NodeProps<TextNode>) {
  const { setNodes } = useReactFlow();

  return (
    <div
      className="text-[16px] px-[1rem] py-[0.5rem] rounded-2xl"
      style={{ backgroundColor: selected ? "#4FB7B3" : color }}
    >
      <div className="flex justify-center items-center gap-2">
        <div className="border">
          <label htmlFor="input"></label>
          <input id="input" type="text" />
        </div>
        <button
          className="border"
          onClick={() =>
            setNodes((prev) => prev.filter((node) => node.id !== id))
          }
        >
          <Cancel className="w-[0.5rem] h-[0.5rem]" />
        </button>
      </div>
      <Handle type="source" className="opacity-0" />
      <Handle type="target" className="opacity-0" />
    </div>
  );
}

// tailwind does not recognize dynamic classes at build time
