/**
 * この形はモック専用ではなく、将来の実バックエンドAPIレスポンスにも
 * 合わせる想定の共有インターフェース。
 * 参照: docs/03_計画・設計/文書メタデータ連携・ツリー構造API.md
 */
/** "other" = ブラウザ内でプレビューせず、ダウンロードのみ提供する形式（Excel等） */
export type DocumentFileType = "pdf" | "image" | "other";
export type DocumentNodeType = "document" | "attachment";

export interface DocumentTreeNode {
  id: string;
  name: string;
  type: DocumentNodeType;
  fileType: DocumentFileType;
  fileUrl: string;
  children: DocumentTreeNode[];
  /** ツリー最上位（type: "document"）にのみ持たせるテキスト形式のメタ情報。 */
  metadata?: MetaField[];
}

export type MetaLeafValue = string | number | boolean | null;

/**
 * ラベル＋内容のメタ情報項目。JSON同様の入れ子が可能：
 * - 単純な項目: `value` のみ
 * - 入れ子グループ（1件）: `children`（さらにラベル＋内容の並び）
 * - 明細（繰り返し行）: `items`（1行＝MetaField[]。各行は同じ並びの項目を想定）
 */
export interface MetaField {
  label: string;
  value?: MetaLeafValue;
  children?: MetaField[];
  items?: MetaField[][];
}
