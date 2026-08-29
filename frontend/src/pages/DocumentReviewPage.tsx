import { useMemo, useRef, useState, type PointerEvent } from "react";
import { findNodeById, flattenTree } from "../mocks/documentTree";
import { useDocumentTree } from "../features/tree/useDocumentTree";
import { DocumentTree } from "../features/tree/DocumentTree";
import { DocumentViewer } from "../features/viewer/DocumentViewer";
import { CompareViewer } from "../features/compare/CompareViewer";
import type { DocumentTreeNode } from "../types/document";

type PaneCount = 2 | 3;

function resizePaneIds(ids: (string | undefined)[], count: PaneCount): (string | undefined)[] {
  const next = ids.slice(0, count);
  while (next.length < count) next.push(undefined);
  return next;
}

const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 480;
// タブレット幅（iPad縦持ち相当）では、既定のツリー幅を狭めてビューア（PDF等）の
// 表示幅をできるだけ確保する。狭い画面でも 300px 固定だとビューアが圧迫されるため。
const TABLET_WIDTH_BREAKPOINT = 900;

function getDefaultSidebarWidth(): number {
  if (typeof window === "undefined") return 300;
  return window.innerWidth < TABLET_WIDTH_BREAKPOINT ? 220 : 300;
}

export function DocumentReviewPage() {
  const { nodes } = useDocumentTree();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(getDefaultSidebarWidth);
  const sidebarDragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [paneCount, setPaneCount] = useState<PaneCount>(2);
  const [paneIds, setPaneIds] = useState<(string | undefined)[]>([undefined, undefined]);
  const [activePaneIndex, setActivePaneIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | undefined>(nodes[0]?.id);

  const selectedNode = selectedId ? findNodeById(nodes, selectedId) : undefined;
  const paneNodes = useMemo(() => paneIds.map((id) => (id ? findNodeById(nodes, id) : undefined)), [paneIds, nodes]);
  const flatList = useMemo(() => flattenTree(nodes), [nodes]);

  const handleToggleCompare = () => {
    setCompareMode((prev) => {
      const next = !prev;
      if (next) {
        // 単票表示 → 比較表示: 今見ていた文書を1番目のペインに引き継ぐ
        setPaneIds(resizePaneIds([selectedId], paneCount));
        setActivePaneIndex(paneCount > 1 ? 1 : 0);
      } else {
        // 比較表示 → 単票表示: 直前に操作していたペインの文書を引き継ぐ
        const carryOver = paneIds[activePaneIndex] ?? paneIds.find((id) => id !== undefined);
        setSelectedId(carryOver);
      }
      return next;
    });
  };

  const handleSetPaneCount = (count: PaneCount) => {
    setPaneCount(count);
    setPaneIds((prev) => resizePaneIds(prev, count));
    setActivePaneIndex((prev) => Math.min(prev, count - 1));
  };

  const handleSelectFromTree = (node: DocumentTreeNode) => {
    if (!compareMode) {
      setSelectedId(node.id);
      return;
    }
    setPaneIds((prev) => {
      const next = [...prev];
      next[activePaneIndex] = node.id;
      return next;
    });
    setActivePaneIndex((prev) => (prev + 1) % paneCount);
  };

  const handleSidebarResizeStart = (e: PointerEvent<HTMLDivElement>) => {
    sidebarDragRef.current = { startX: e.clientX, startWidth: sidebarWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleSidebarResizeMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!sidebarDragRef.current) return;
    const delta = e.clientX - sidebarDragRef.current.startX;
    setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, sidebarDragRef.current.startWidth + delta)));
  };
  const handleSidebarResizeEnd = () => {
    sidebarDragRef.current = null;
  };

  const handleNavigatePane = (index: number, node: DocumentTreeNode) => {
    setPaneIds((prev) => {
      const next = [...prev];
      next[index] = node.id;
      return next;
    });
  };

  const selectionBadges = useMemo(() => {
    const map = new Map<string, number | "•">();
    if (compareMode) {
      paneIds.forEach((id, index) => {
        if (id) map.set(id, index + 1);
      });
    } else if (selectedId) {
      map.set(selectedId, "•");
    }
    return map;
  }, [compareMode, paneIds, selectedId]);

  return (
    <div className="review-page">
      <header className="review-page__header">
        <div className="review-page__header-left">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "文書ツリーを表示" : "文書ツリーを隠す（表示スペースを広げる）"}
          >
            {sidebarCollapsed ? "▶ ツリー表示" : "◀ ツリーを隠す"}
          </button>
          <h1>文書承認ビューア（プロトタイプ）</h1>
        </div>
        <div className="review-page__header-right">
          {compareMode && (
            <div className="pane-count-switch" role="group" aria-label="比較するペイン数">
              <button type="button" className={paneCount === 2 ? "is-active" : ""} onClick={() => handleSetPaneCount(2)}>
                2枚比較
              </button>
              <button type="button" className={paneCount === 3 ? "is-active" : ""} onClick={() => handleSetPaneCount(3)}>
                3枚比較
              </button>
            </div>
          )}
          <label className="compare-toggle">
            <input type="checkbox" checked={compareMode} onChange={handleToggleCompare} />
            文書比較モード
          </label>
        </div>
      </header>

      <div className="review-page__body">
        <aside
          className={`review-page__sidebar${sidebarCollapsed ? " review-page__sidebar--collapsed" : ""}`}
          style={sidebarCollapsed ? undefined : { width: sidebarWidth }}
        >
          {!sidebarCollapsed && (
            <>
              <h2 className="review-page__sidebar-title">文書ツリー</h2>
              <DocumentTree nodes={nodes} selectionBadges={selectionBadges} onSelectDocument={handleSelectFromTree} />
            </>
          )}
        </aside>

        {/* ツリー幅をドラッグで調整できるようにし、PDF等の表示幅を必要に応じて広げられるようにする */}
        {!sidebarCollapsed && (
          <div
            className="sidebar-resizer"
            onPointerDown={handleSidebarResizeStart}
            onPointerMove={handleSidebarResizeMove}
            onPointerUp={handleSidebarResizeEnd}
            title="ドラッグしてツリーの幅を調整"
          />
        )}

        <main className="review-page__main">
          {compareMode ? (
            <CompareViewer
              panes={paneNodes}
              activeIndex={activePaneIndex}
              onSelectPane={setActivePaneIndex}
              flatList={flatList}
              onNavigatePane={handleNavigatePane}
            />
          ) : (
            <DocumentViewer node={selectedNode} flatList={flatList} onNavigate={(n) => setSelectedId(n.id)} />
          )}
        </main>
      </div>
    </div>
  );
}
