import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve(import.meta.dirname, "../public/mock-files");
await mkdir(outDir, { recursive: true });

async function makePdf(fileName, pages) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  pages.forEach((pageText, i) => {
    const page = pdf.addPage([595, 842]); // A4
    page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(1, 1, 1) });
    page.drawRectangle({ x: 20, y: 802, width: 555, height: 20, color: rgb(0.16, 0.32, 0.55) });
    page.drawText(pageText.title, { x: 40, y: 750, size: 22, font, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`Page ${i + 1} / ${pages.length}`, { x: 40, y: 720, size: 12, font: bodyFont, color: rgb(0.4, 0.4, 0.4) });
    let y = 670;
    for (const line of pageText.lines) {
      page.drawText(line, { x: 40, y, size: 13, font: bodyFont, color: rgb(0.15, 0.15, 0.15) });
      y -= 24;
    }
    page.drawText("(This document is dummy content for prototype review.)", {
      x: 40,
      y: 40,
      size: 9,
      font: bodyFont,
      color: rgb(0.6, 0.6, 0.6),
    });
  });
  const bytes = await pdf.save();
  await writeFile(path.join(outDir, fileName), bytes);
  console.log("wrote", fileName);
}

function svgImage(fileName, label, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842">
  <rect width="595" height="842" fill="#ffffff" stroke="#cccccc" stroke-width="2"/>
  <rect x="0" y="0" width="595" height="60" fill="${color}"/>
  <text x="30" y="38" font-size="24" fill="#ffffff" font-family="sans-serif">${label}</text>
  <rect x="60" y="140" width="475" height="300" fill="#f2f2f2" stroke="#bbbbbb"/>
  <text x="120" y="300" font-size="18" fill="#888888" font-family="sans-serif">(サンプル画像)</text>
  <text x="30" y="800" font-size="11" fill="#999999" font-family="sans-serif">※プロトタイプ確認用のダミー画像です。</text>
</svg>`;
  return writeFile(path.join(outDir, fileName), svg, "utf-8");
}

// NOTE: pdf-lib's built-in standard fonts (WinAnsi) cannot encode Japanese glyphs
// without embedding an external CJK font. Since this is throwaway mock content
// for the prototype (the on-screen tree labels are plain React text and DO
// support Japanese), the in-PDF body text below is romanized instead.
await makePdf("shutcho-shinsei.pdf", [
  {
    title: "Business Trip Request",
    lines: [
      "Applicant: Taro Yamada (Sales Dept.)",
      "Destination: Osaka Branch",
      "Period: 2026/09/10 - 2026/09/12",
      "Purpose: New client visit / negotiation",
    ],
  },
  {
    title: "Business Trip Request (cont.)",
    lines: ["Estimated cost: JPY 45,000", "Lodging: 2 nights", "Approval: __________"],
  },
]);

await makePdf("ryoshusho.pdf", [
  { title: "Receipt", lines: ["To: Taro Yamada", "Amount: JPY 12,800", "For: Lodging", "Issuer: XX Hotel Osaka"] },
]);

await svgImage("koutsuhi-meisai.svg", "交通費明細（写し）", "#3a5a99");

await makePdf("keiyakusho.pdf", [
  { title: "Service Agreement", lines: ["Party A: Nihon Data Co., Ltd.", "Party B: XX Corp.", "Term: 2026/10/01 - 2027/09/30"] },
  { title: "Service Agreement (Article 2)", lines: ["Article 2 (Scope of work)", "System development / maintenance"] },
  { title: "Service Agreement (Article 3)", lines: ["Article 3 (Fee)", "Monthly fee: JPY 800,000 (excl. tax)"] },
]);

await makePdf("bessi1.pdf", [
  { title: "Appendix 1: Spec Overview", lines: ["Target system: Document Approval Viewer", "Languages: TypeScript / Java"] },
]);

await svgImage("bessi1-zumen.svg", "別紙1 添付：システム構成図", "#8a5a3a");
await svgImage("bessi2.svg", "別紙2：検収基準（写し）", "#3a8a5a");

await makePdf("ringisho.pdf", [
  { title: "Approval Request", lines: ["Subject: Adoption of Document Approval Viewer", "Drafted by: IT Dept.", "Date: 2026/08/20"] },
]);

// プレビュー非対応（fileType: "other"）のダウンロード導線を確認するためのダミー添付。
// 実際のExcelファイルではない（拡張子だけ .xlsx のプレーンテキスト）。
await writeFile(
  path.join(outDir, "keihi-uchiwake.xlsx"),
  "これはプロトタイプ確認用のダミーファイルです。\nExcel等プレビュー非対応ファイルのダウンロード動線の確認用。\n",
  "utf-8",
);

console.log("done");
