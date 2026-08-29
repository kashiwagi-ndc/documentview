import { useMemo, useRef, useState, type PointerEvent } from "react";
import type { MetaField } from "../../types/document";
import { countMetaFields, filterMetaFields } from "../../utils/metaField";
import { MetaFieldGroup } from "./MetaFieldGroup";

interface Props {
  fields: MetaField[];
}

const DEFAULT_HEIGHT = 240;
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 560;

/**
 * 上位文書の伝票情報（項目名＋内容、入れ子・明細対応）を表示するパネル。
 * 参照: docs/03_計画・設計/文書メタ情報表示.md
 */
export function MetadataPanel({ fields }: Props) {
  const [open, setOpen] = useState(true);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [query, setQuery] = useState("");
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const totalCount = useMemo(() => countMetaFields(fields), [fields]);
  const visibleFields = useMemo(
    () => (query.trim() ? filterMetaFields(fields, query.trim()) : fields),
    [fields, query],
  );

  const handleResizeStart = (e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = { startY: e.clientY, startHeight: height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleResizeMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const delta = dragRef.current.startY - e.clientY; // 上にドラッグ = 拡大
    setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, dragRef.current.startHeight + delta)));
  };
  const handleResizeEnd = () => {
    dragRef.current = null;
  };

  return (
    <div className="meta-panel">
      <div className="meta-panel__toggle-row">
        <button type="button" className="meta-panel__toggle" onClick={() => setOpen((v) => !v)}>
          <span className={`meta-field__chevron${open ? " meta-field__chevron--open" : ""}`}>▸</span>
          伝票情報（{totalCount}項目）
        </button>
        {open && (
          <input
            type="text"
            className="meta-panel__search"
            placeholder="項目名・値で絞り込み"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
      </div>
      {open && (
        <>
          <div
            className="meta-panel__resizer"
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            title="ドラッグして高さを調整"
          />
          <div className="meta-panel__body" style={{ height }}>
            {visibleFields.length === 0 ? (
              <div className="meta-panel__empty">「{query}」に一致する項目がありません</div>
            ) : (
              <MetaFieldGroup fields={visibleFields} depth={0} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
