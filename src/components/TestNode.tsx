import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

type TestNode = Node<{ value: string; color: string }, "custom">;

export default function TestNode({ data }: NodeProps<TestNode>) {
  return (
    <div
      className="text-[16px] px-[1rem] py-[0.5rem] rounded-2xl"
      style={{ backgroundColor: data.color }}
    >
      {data.value}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

// tailwind does not recognize dynamic classes at build time
