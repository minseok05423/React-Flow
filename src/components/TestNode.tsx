import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import Cancel from "../assets/cancel.svg?react";

type TestNode = Node<{ value: string; color: string }, "custom">;

export default function TestNode({ data }: NodeProps<TestNode>) {
  return (
    <>
      <div
        className="text-[16px] px-[1rem] py-[0.5rem] rounded-2xl"
        style={{ backgroundColor: data.color }}
      >
        <div className="flex justify-center items-center gap-2">
          <div className="border">{data.value}</div>
          <Cancel className="w-[0.5rem] h-[0.5rem]" />
        </div>
        <Handle type="source" position={Position.Right} />
        <Handle type="target" position={Position.Left} />
      </div>
    </>
  );
}

// tailwind does not recognize dynamic classes at build time
