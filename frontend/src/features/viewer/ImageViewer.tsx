import { useState } from "react";

interface Props {
  fileUrl: string;
}

export function ImageViewer({ fileUrl }: Props) {
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(false);

  return (
    <div className="viewer viewer--image">
      <div className="viewer-toolbar">
        <button type="button" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))} aria-label="縮小">
          −
        </button>
        <span className="viewer-toolbar__pageinfo">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => setScale((s) => Math.min(3, s + 0.2))} aria-label="拡大">
          ＋
        </button>
        <button type="button" onClick={() => setScale(1)}>
          等倍にフィット
        </button>
      </div>
      <div className="viewer-canvas viewer-canvas--scrollable">
        {error ? (
          <div className="viewer-empty viewer-empty--error">この画像を表示できませんでした。</div>
        ) : (
          // biome-ignore lint: プレビュー用途の等倍/拡大表示のため <img> を直接使用
          <img
            src={fileUrl}
            alt=""
            style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
}
