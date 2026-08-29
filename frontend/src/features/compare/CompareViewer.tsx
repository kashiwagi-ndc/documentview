import type { DocumentTreeNode } from "../../types/document";
import { DocumentViewer } from "../viewer/DocumentViewer";

interface Props {
  panes: (DocumentTreeNode | undefined)[];
  activeIndex: number;
  onSelectPane: (index: number) => void;
  flatList: DocumentTreeNode[];
  onNavigatePane: (index: number, node: DocumentTreeNode) => void;
}

const PANE_LABELS = ["①", "②", "③"];

/**
 * 異なる文書（2〜3件）を並べて比較表示する。
 * 参照: docs/03_計画・設計/2文書比較表示（分割ビュー）.md
 */
export function CompareViewer({ panes, activeIndex, onSelectPane, flatList, onNavigatePane }: Props) {
  return (
    <div className={`compare compare--panes${panes.length}`}>
      {panes.map((node, index) => (
        <div key={index} className={`compare__pane${activeIndex === index ? " compare__pane--active" : ""}`}>
          <button
            type="button"
            className="compare__pane-header"
            onClick={() => onSelectPane(index)}
            title="ここをクリックしてから、ツリーで文書を選ぶとこのペインに表示されます"
          >
            {PANE_LABELS[index]} ペイン{index + 1}
            {activeIndex === index && <span className="compare__pane-active-badge">選択中</span>}
          </button>
          <DocumentViewer
            node={node}
            emptyMessage="ツリーで文書を選択してください（このペインが対象です）。"
            flatList={flatList}
            onNavigate={(n) => onNavigatePane(index, n)}
          />
        </div>
      ))}
    </div>
  );
}
