import type { MetaField, MetaLeafValue } from "../types/document";

export function formatMetaValue(value: MetaLeafValue | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "はい" : "いいえ";
  return String(value);
}

export function countMetaFields(fields: MetaField[]): number {
  let count = 0;
  for (const field of fields) {
    count += 1;
    if (field.children) count += countMetaFields(field.children);
    if (field.items) count += field.items.reduce((sum, row) => sum + countMetaFields(row), 0);
  }
  return count;
}

function fieldMatches(field: MetaField, query: string): boolean {
  if (field.label.toLowerCase().includes(query)) return true;
  if (field.value !== undefined && field.value !== null && String(field.value).toLowerCase().includes(query)) return true;
  return false;
}

/** ラベル・値のテキストで絞り込む（一致した項目、または子孫に一致がある入れ子グループ／明細を残す）。 */
export function filterMetaFields(fields: MetaField[], query: string): MetaField[] {
  const q = query.toLowerCase();
  const result: MetaField[] = [];

  for (const field of fields) {
    const selfMatches = fieldMatches(field, q);

    if (field.children) {
      const filteredChildren = selfMatches ? field.children : filterMetaFields(field.children, query);
      if (selfMatches || filteredChildren.length > 0) {
        result.push({ ...field, children: filteredChildren });
      }
      continue;
    }

    if (field.items) {
      if (selfMatches) {
        result.push(field);
        continue;
      }
      const filteredRows = field.items.filter((row) => row.some((cell) => fieldMatches(cell, q)));
      if (filteredRows.length > 0) result.push({ ...field, items: filteredRows });
      continue;
    }

    if (selfMatches) result.push(field);
  }

  return result;
}
