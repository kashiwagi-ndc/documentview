import { documentTree } from "../../mocks/documentTree";
import type { DocumentTreeNode } from "../../types/document";

/**
 * 今回はモックデータを返すだけ。将来ここを `GET /api/cases/{caseId}/tree`
 * を叩く実装に差し替える想定（戻り値の形はそのまま維持できるようにしてある）。
 * 参照: docs/03_計画・設計/文書ツリー表示UI.md
 */
export function useDocumentTree(): { nodes: DocumentTreeNode[] } {
  return { nodes: documentTree };
}
