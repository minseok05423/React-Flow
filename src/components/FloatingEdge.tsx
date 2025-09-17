import { getBezierPath, useInternalNode } from "@xyflow/react";

import { getEdgeParams } from "./initialElements";

interface FloatingEdgeProps {
  id: string;
  source: string;
  target: string;
  markerEnd?: any;
  style?: any;
}

function FloatingEdge({
  id,
  source,
  target,
  markerEnd,
  style,
}: FloatingEdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
      style={style}
    />
  );
}

export default FloatingEdge;
