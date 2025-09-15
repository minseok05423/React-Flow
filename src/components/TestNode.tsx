import type { Node, NodeProps } from "@xyflow/react";

type TestNode = Node<{ value: string; color: string }, "custom">;

export default function TestNode({ data }: NodeProps<TestNode>) {
  return <div>{data.value}</div>;
}
