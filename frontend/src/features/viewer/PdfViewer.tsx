import { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface Props {
  fileUrl: string;
}

// .viewer-canvas の左右パディング（16px ずつ）分を差し引く
const CANVAS_HORIZONTAL_PADDING = 32;

function computeFitScale(containerEl: HTMLElement | null, naturalWidth: number | undefined): number | undefined {
  if (!containerEl || !naturalWidth) return undefined;
  const available = containerEl.clientWidth - CANVAS_HORIZONTAL_PADDING;
  if (available <= 0) return undefined;
  return Math.min(3, Math.max(0.3, available / naturalWidth));
}

export function PdfViewer({ fileUrl }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [pageNaturalWidth, setPageNaturalWidth] = useState<number>();
  const [hasAutoFitted, setHasAutoFitted] = useState(false);
  const [error, setError] = useState(false);

  const handleFitWidth = () => {
    const fitScale = computeFitScale(canvasRef.current, pageNaturalWidth);
    if (fitScale) setScale(fitScale);
  };

  return (
    <div className="viewer viewer--pdf">
      <div className="viewer-toolbar">
        <button type="button" disabled={pageNumber <= 1} onClick={() => setPageNumber((p) => p - 1)}>
          ← 前のページ
        </button>
        <span className="viewer-toolbar__pageinfo">
          {numPages ? `${pageNumber} / ${numPages} ページ` : "読み込み中..."}
        </span>
        <button type="button" disabled={!numPages || pageNumber >= numPages} onClick={() => setPageNumber((p) => p + 1)}>
          次のページ →
        </button>
        <span className="viewer-toolbar__divider" />
        <button type="button" onClick={() => setScale((s) => Math.max(0.3, s - 0.2))} aria-label="縮小">
          −
        </button>
        <span className="viewer-toolbar__pageinfo">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => setScale((s) => Math.min(3, s + 0.2))} aria-label="拡大">
          ＋
        </button>
        <button type="button" disabled={!pageNaturalWidth} onClick={handleFitWidth}>
          幅に合わせる
        </button>
      </div>
      <div className="viewer-canvas" ref={canvasRef}>
        {error ? (
          <div className="viewer-empty viewer-empty--error">このファイルを表示できませんでした。</div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              setPageNumber(1);
            }}
            onLoadError={() => setError(true)}
            loading={<div className="viewer-empty">読み込み中...</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              onLoadSuccess={(page) => {
                setPageNaturalWidth(page.originalWidth);
                // 文書を開いた直後の1回だけ、幅に合わせて自動フィットする
                // （以降のページ送りではユーザーが選んだ拡大率を維持する）
                if (!hasAutoFitted) {
                  const fitScale = computeFitScale(canvasRef.current, page.originalWidth);
                  if (fitScale) setScale(fitScale);
                  setHasAutoFitted(true);
                }
              }}
            />
          </Document>
        )}
      </div>
    </div>
  );
}
