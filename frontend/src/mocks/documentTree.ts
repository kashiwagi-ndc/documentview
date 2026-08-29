import type { DocumentTreeNode, MetaField } from "../types/document";

const base = import.meta.env.BASE_URL + "mock-files/";

/** 明細（表）の1行を組み立てる小さなヘルパー。 */
function row(pairs: [string, MetaField["value"]][]): MetaField[] {
  return pairs.map(([label, value]) => ({ label, value }));
}

/**
 * プロトタイプ確認用のダミーデータ。
 * 参照: docs/03_計画・設計/モック文書データ.md
 * - 案件（親文書）を複数件、添付を含めてツリー化
 * - PDF/画像の両方を含む
 * - 2段階ネスト（別紙1配下に図面）を1件用意
 * - 添付ゼロ件の案件を1件用意
 * - 複数ページPDFを含む
 */
export const documentTree: DocumentTreeNode[] = [
  {
    id: "case-1",
    name: "出張申請書（山田太郎・大阪支店）",
    type: "document",
    fileType: "pdf",
    fileUrl: base + "shutcho-shinsei.pdf",
    metadata: [
      { label: "申請番号", value: "TR-2026-0912" },
      { label: "申請日", value: "2026/08/25" },
      { label: "出張先", value: "大阪支店" },
      { label: "出張目的", value: "新規顧客訪問および商談" },
      { label: "出発日", value: "2026/09/10" },
      { label: "帰着日", value: "2026/09/12" },
      { label: "交通手段", value: "新幹線" },
      { label: "宿泊有無", value: true },
      { label: "宿泊数", value: "2泊" },
      { label: "概算旅費", value: "45,000円" },
      { label: "承認ルート", value: "部長 → 経理部" },
      { label: "現在のステータス", value: "承認待ち" },
      { label: "緊急区分", value: "通常" },
      {
        label: "申請者情報",
        children: [
          { label: "氏名", value: "山田 太郎" },
          { label: "社員番号", value: "E-10234" },
          { label: "所属部署", value: "営業部" },
          { label: "役職", value: "主任" },
          { label: "内線番号", value: "1234" },
        ],
      },
      {
        label: "経費明細",
        items: [
          row([
            ["日付", "2026/09/10"],
            ["費目", "交通費（新幹線）"],
            ["金額", "14,000円"],
            ["摘要", "東京-新大阪 往復"],
          ]),
          row([
            ["日付", "2026/09/10"],
            ["費目", "宿泊費"],
            ["金額", "12,800円"],
            ["摘要", "XXホテル大阪 1泊目"],
          ]),
          row([
            ["日付", "2026/09/11"],
            ["費目", "宿泊費"],
            ["金額", "12,800円"],
            ["摘要", "XXホテル大阪 2泊目"],
          ]),
          row([
            ["日付", "2026/09/11"],
            ["費目", "交通費（タクシー）"],
            ["金額", "1,800円"],
            ["摘要", "顧客先移動"],
          ]),
          row([
            ["日付", "2026/09/10"],
            ["費目", "交際費"],
            ["金額", "8,000円"],
            ["摘要", "顧客との会食"],
          ]),
          row([
            ["日付", "2026/09/12"],
            ["費目", "交通費（在来線）"],
            ["金額", "600円"],
            ["摘要", "新大阪駅-大阪支店"],
          ]),
        ],
      },
    ],
    children: [
      {
        id: "case-1-att-1",
        name: "領収書（宿泊費）",
        type: "attachment",
        fileType: "pdf",
        fileUrl: base + "ryoshusho.pdf",
        children: [],
      },
      {
        id: "case-1-att-2",
        name: "交通費明細（写し）",
        type: "attachment",
        fileType: "image",
        fileUrl: base + "koutsuhi-meisai.svg",
        children: [],
      },
      {
        id: "case-1-att-3",
        name: "経費内訳（Excel）",
        type: "attachment",
        fileType: "other",
        fileUrl: base + "keihi-uchiwake.xlsx",
        children: [],
      },
    ],
  },
  {
    id: "case-2",
    name: "業務委託契約書（〇〇株式会社）",
    type: "document",
    fileType: "pdf",
    fileUrl: base + "keiyakusho.pdf",
    metadata: [
      { label: "契約番号", value: "CT-2026-0450" },
      { label: "契約種別", value: "業務委託契約" },
      { label: "契約締結日", value: "2026/09/25" },
      { label: "契約開始日", value: "2026/10/01" },
      { label: "契約終了日", value: "2027/09/30" },
      { label: "自動更新", value: true },
      { label: "契約金額（月額）", value: "800,000円（税別）" },
      { label: "支払サイト", value: "翌月末払い" },
      { label: "契約担当部署", value: "情報システム部" },
      { label: "契約担当者", value: "佐藤 花子" },
      { label: "承認ルート", value: "課長 → 部長 → 法務部 → 役員" },
      { label: "現在のステータス", value: "法務部確認中" },
      { label: "秘密保持条項", value: true },
      { label: "再委託の可否", value: "事前承諾ありの場合のみ可" },
      { label: "契約不適合責任期間", value: "検収後6ヶ月" },
      { label: "中途解約条項", value: "3ヶ月前の書面通知により可" },
      { label: "反社会的勢力排除条項", value: true },
      { label: "準拠法", value: "日本法" },
      { label: "管轄裁判所", value: "東京地方裁判所" },
      {
        label: "甲（委託者）",
        children: [
          { label: "会社名", value: "株式会社日本データ" },
          { label: "住所", value: "東京都千代田区〇〇 1-2-3" },
          { label: "代表者", value: "代表取締役 田中 一郎" },
          { label: "担当窓口", value: "情報システム部 佐藤 花子" },
        ],
      },
      {
        label: "乙（受託者）",
        children: [
          { label: "会社名", value: "〇〇株式会社" },
          { label: "住所", value: "大阪府大阪市〇〇 4-5-6" },
          { label: "代表者", value: "代表取締役 鈴木 次郎" },
          { label: "担当窓口", value: "営業部 高橋 三郎" },
        ],
      },
      {
        label: "支払スケジュール",
        items: [
          row([
            ["回", "第1回"],
            ["対象月", "2026/10"],
            ["金額", "800,000円"],
            ["支払予定日", "2026/11/30"],
          ]),
          row([
            ["回", "第2回"],
            ["対象月", "2026/11"],
            ["金額", "800,000円"],
            ["支払予定日", "2026/12/28"],
          ]),
          row([
            ["回", "第3回"],
            ["対象月", "2026/12"],
            ["金額", "800,000円"],
            ["支払予定日", "2027/01/29"],
          ]),
        ],
      },
    ],
    children: [
      {
        id: "case-2-att-1",
        name: "別紙1：仕様概要",
        type: "attachment",
        fileType: "pdf",
        fileUrl: base + "bessi1.pdf",
        children: [
          {
            id: "case-2-att-1-1",
            name: "別紙1 添付：システム構成図",
            type: "attachment",
            fileType: "image",
            fileUrl: base + "bessi1-zumen.svg",
            children: [],
          },
        ],
      },
      {
        id: "case-2-att-2",
        name: "別紙2：検収基準（写し）",
        type: "attachment",
        fileType: "image",
        fileUrl: base + "bessi2.svg",
        children: [],
      },
    ],
  },
  {
    id: "case-3",
    name: "稟議書（文書承認ビューア導入について）",
    type: "document",
    fileType: "pdf",
    fileUrl: base + "ringisho.pdf",
    metadata: [
      { label: "起案番号", value: "RG-2026-0088" },
      { label: "件名", value: "文書承認ビューア導入について" },
      { label: "起案部署", value: "情報システム部" },
      { label: "起案日", value: "2026/08/20" },
      { label: "予算区分", value: "システム投資枠" },
      { label: "概算予算", value: "未定（プロトタイプ検証段階）" },
      { label: "現在のステータス", value: "検討中" },
    ],
    children: [],
  },
];

/** ツリーをフラット化した「表示順」の配列。関連文書の前後切替に使う。 */
export function flattenTree(nodes: DocumentTreeNode[]): DocumentTreeNode[] {
  const result: DocumentTreeNode[] = [];
  const walk = (list: DocumentTreeNode[]) => {
    for (const node of list) {
      result.push(node);
      if (node.children.length > 0) walk(node.children);
    }
  };
  walk(nodes);
  return result;
}

export function findNodeById(nodes: DocumentTreeNode[], id: string): DocumentTreeNode | undefined {
  return flattenTree(nodes).find((n) => n.id === id);
}
