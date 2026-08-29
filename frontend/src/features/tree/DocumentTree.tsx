import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { DocumentTreeNode as TreeNode } from "../../types/document";
import { DocumentTreeNode } from "./DocumentTreeNode";

interface Props {
  nodes: TreeNode[];
  selectionBadges: Map<string, number | "•">;
  onSelectDocument: (node: TreeNode) => void;
}

function collectAllIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      ids.push(n.id);
      if (n.children.length) walk(n.children);
    }
  };
  walk(nodes);
  return ids;
}

/** 展開状態を考慮した「今見えている順」のフラットID一覧（上下キー移動用）。 */
function visibleIds(nodes: TreeNode[], expanded: Set<string>): string[] {
  const ids: string[] = [];
  const walk = (list: TreeNode[]) => {
    for (const n of list) {
      ids.push(n.id);
      if (n.children.length && expanded.has(n.id)) walk(n.children);
    }
  };
  walk(nodes);
  return ids;
}

export function DocumentTree({ nodes, selectionBadges, onSelectDocument }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(collectAllIds(nodes)));
  const [focusedId, setFocusedId] = useState<string | undefined>(nodes[0]?.id);
  const containerRef = useRef<HTMLUListElement>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visible = useMemo(() => visibleIds(nodes, expandedIds), [nodes, expandedIds]);

  const focusNode = (id: string) => {
    setFocusedId(id);
    requestAnimationFrame(() => {
      containerRef.current?.querySelector<HTMLElement>(`[data-node-id="${id}"]`)?.focus();
    });
  };

  const handleContainerKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    if (!focusedId) return;
    const idx = visible.indexOf(focusedId);
    if (idx === -1) return;
    e.preventDefault();
    const nextIdx = e.key === "ArrowDown" ? Math.min(idx + 1, visible.length - 1) : Math.max(idx - 1, 0);
    focusNode(visible[nextIdx]);
  };

  return (
    <ul role="tree" aria-label="文書ツリー" className="tree-root" ref={containerRef} onKeyDown={handleContainerKeyDown}>
      {nodes.map((node) => (
        <DocumentTreeNode
          key={node.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          onSelect={onSelectDocument}
          selectionBadges={selectionBadges}
          focusedId={focusedId}
          onFocus={setFocusedId}
        />
      ))}
    </ul>
  );
}
