import type { DocumentTreeNode } from "../../types/document";
import { getFileExtension, getFileName } from "../../utils/file";

interface Props {
  node: DocumentTreeNode;
}

/**
 * PDF/画像以外（Excel等）はブラウザ内でプレビューせず、ダウンロードを促す。
 * 参照: docs/03_計画・設計/ファイルダウンロード機能.md
 */
export function UnsupportedFileViewer({ node }: Props) {
  const ext = getFileExtension(node.fileUrl);
  return (
    <div className="viewer viewer--unsupported">
      <div className="viewer-unsupported">
        <div className="viewer-unsupported__badge">{ext || "FILE"}</div>
        <p className="viewer-unsupported__text">
          この形式（{ext ? `.${ext}` : "不明な形式"}）はブラウザ内でプレビューできません。
          <br />
          ダウンロードしてお手元のアプリでご確認ください。
        </p>
        <a className="download-button download-button--large" href={node.fileUrl} download={getFileName(node.fileUrl)}>
          ダウンロードして確認する
        </a>
      </div>
    </div>
  );
}
