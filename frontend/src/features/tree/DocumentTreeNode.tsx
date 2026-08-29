import type { KeyboardEvent } from "react";
import type { DocumentTreeNode as TreeNode } from "../../types/document";
import { getFileExtension } from "../../utils/file";
import { ChevronIcon, ImageIcon, OtherFileIcon, PdfIcon } from "./icons";

interface Props {
  node: TreeNode;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (node: TreeNode) => void;
  selectionBadges: Map<string, number | "•">;
  focusedId: string | undefined;
  onFocus: (id: string) => void;
}

export function DocumentTreeNode({
  node,
  depth,
  expandedIds,
  onToggleExpand,
  onSelect,
  selectionBadges,
  focusedId,
  onFocus,
}: Props) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.id);
  const badge = selectionBadges.get(node.id);
  const isFocused = focusedId === node.id;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(node);
    } else if (e.key === "ArrowRight" && hasChildren && !expanded) {
      e.preventDefault();
      onToggleExpand(node.id);
    } else if (e.key === "ArrowLeft" && hasChildren && expanded) {
      e.preventDefault();
      onToggleExpand(node.id);
    }
  };

  return (
    <li role="none">
      <div
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-selected={!!badge}
        tabIndex={isFocused ? 0 : -1}
        data-node-id={node.id}
        className={`tree-row${badge ? " tree-row--selected" : ""}`}
        style={{ paddingLeft: 10 + depth * 16 }}
        onClick={() => {
          onFocus(node.id);
          onSelect(node);
        }}
        onFocus={() => onFocus(node.id)}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="tree-caret"
          aria-label={expanded ? "折りたたむ" : "展開する"}
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(node.id);
          }}
          style={{ visibility: hasChildren ? "visible" : "hidden" }}
        >
          <ChevronIcon expanded={expanded} />
        </button>
        <span className="tree-icon">
          {node.fileType === "pdf" ? (
            <PdfIcon />
          ) : node.fileType === "image" ? (
            <ImageIcon />
          ) : (
            <OtherFileIcon ext={getFileExtension(node.fileUrl)} />
          )}
        </span>
        <span className="tree-name">{node.name}</span>
        {badge !== undefined && (
          <span className={`tree-badge ${badge === "•" ? "tree-badge--dot" : `tree-badge--pane${badge}`}`}>{badge}</span>
        )}
      </div>
      {hasChildren && expanded && (
        <ul role="group" className="tree-group">
          {node.children.map((child) => (
            <DocumentTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              selectionBadges={selectionBadges}
              focusedId={focusedId}
              onFocus={onFocus}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
