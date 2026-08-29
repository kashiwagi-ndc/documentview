import type { MetaField } from "../../types/document";
import { formatMetaValue } from "../../utils/metaField";

interface Props {
  rows: MetaField[][];
}

/** 明細（繰り返し行）はラベル×値の縦積みではなく、スキャンしやすい表形式で見せる。 */
export function MetaFieldTable({ rows }: Props) {
  if (rows.length === 0) return null;
  const columns = rows[0].map((field) => field.label);

  return (
    <div className="meta-table-wrap">
      <table className="meta-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{formatMetaValue(cell.value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
