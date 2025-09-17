import {
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import Cancel from "../assets/cancel.svg?react";

type DefaultNode = Node<{ value: string; color: string }, "custom">;

export default function DefaultNode({
  id,
  data: { value, color = "#D9E9CF" },
}: NodeProps<DefaultNode>) {
  const { setNodes } = useReactFlow();

  return (
    <div
      className="text-[16px] px-[1rem] py-[0.5rem] rounded-2xl"
      style={{ backgroundColor: color }}
    >
      <div className="flex justify-center items-center gap-2">
        <div className="border">{value}</div>
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
