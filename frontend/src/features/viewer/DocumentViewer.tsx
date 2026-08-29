import type { DocumentTreeNode } from "../../types/document";
import { getFileName } from "../../utils/file";
import { MetadataPanel } from "../meta/MetadataPanel";
import { ImageViewer } from "./ImageViewer";
import { PdfViewer } from "./PdfViewer";
import { UnsupportedFileViewer } from "./UnsupportedFileViewer";

interface Props {
  node: DocumentTreeNode | undefined;
  emptyMessage?: string;
  /** 前後移動の対象となる文書一覧（ツリー表示順）。省略時は前後移動ボタンを出さない。 */
  flatList?: DocumentTreeNode[];
  onNavigate?: (node: DocumentTreeNode) => void;
}

export function DocumentViewer({ node, emptyMessage = "ツリーから文書を選択してください。", flatList, onNavigate }: Props) {
  if (!node) {
    return (
      <div className="viewer viewer--empty">
        <div className="viewer-empty">{emptyMessage}</div>
      </div>
    );
  }

  const canNavigate = flatList !== undefined && onNavigate !== undefined;
  const currentIndex = canNavigate ? flatList.findIndex((n) => n.id === node.id) : -1;
  const prevNode = currentIndex > 0 ? flatList![currentIndex - 1] : undefined;
  const nextNode = currentIndex !== -1 && currentIndex < flatList!.length - 1 ? flatList![currentIndex + 1] : undefined;

  return (
    <div className="viewer-frame">
      {/* ツリーを隠した状態でも文書間を移動できるよう、ヘッダー内（表示領域を圧迫しない位置）に前後移動を置く */}
      <div className="viewer-frame__header">
        <div className="viewer-frame__title-group">
          {canNavigate && (
            <button
              type="button"
              className="nav-arrow-button"
              disabled={!prevNode}
              onClick={() => prevNode && onNavigate!(prevNode)}
              title="前の関連文書へ"
            >
              ◀
            </button>
          )}
          <span className="viewer-frame__name">{node.name}</span>
          {canNavigate && (
            <button
              type="button"
              className="nav-arrow-button"
              disabled={!nextNode}
              onClick={() => nextNode && onNavigate!(nextNode)}
              title="次の関連文書へ"
            >
              ▶
            </button>
          )}
        </div>
        <a className="download-button" href={node.fileUrl} download={getFileName(node.fileUrl)}>
          ダウンロード
        </a>
      </div>
      {/* key={node.fileUrl}: 文書切替のたびに内部状態（ページ番号・拡大率）をまっさらに戻す。
          使い回すと、旧ファイルのページ番号のまま新ファイルへ Page を要求してしまい
          "Invalid page request" が一瞬発生するため。 */}
      {node.fileType === "pdf" ? (
        <PdfViewer key={node.fileUrl} fileUrl={node.fileUrl} />
      ) : node.fileType === "image" ? (
        <ImageViewer key={node.fileUrl} fileUrl={node.fileUrl} />
      ) : (
        <UnsupportedFileViewer key={node.fileUrl} node={node} />
      )}
      {/* 伝票情報は最上位の文書（type: "document"）にのみ持たせる想定。添付には出さない。 */}
      {node.type === "document" && node.metadata && node.metadata.length > 0 && (
        <MetadataPanel key={node.id} fields={node.metadata} />
      )}
    </div>
  );
}
