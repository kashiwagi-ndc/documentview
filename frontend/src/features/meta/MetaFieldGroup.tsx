import { useState } from "react";
import type { MetaField } from "../../types/document";
import { formatMetaValue } from "../../utils/metaField";
import { MetaFieldTable } from "./MetaFieldTable";

interface Props {
  fields: MetaField[];
  depth: number;
}

export function MetaFieldGroup({ fields, depth }: Props) {
  return (
    <div className="meta-fields" style={depth > 0 ? { marginLeft: 14 } : undefined}>
      {fields.map((field, index) => {
        if (field.items) {
          return (
            <div key={index} className="meta-field meta-field--table">
              <div className="meta-field__group-label">
                {field.label}
                <span className="meta-field__count">（{field.items.length}件）</span>
              </div>
              <MetaFieldTable rows={field.items} />
            </div>
          );
        }
        if (field.children) {
          return <NestedGroup key={index} field={field} depth={depth} />;
        }
        return (
          <div key={index} className="meta-field">
            <span className="meta-field__label">{field.label}</span>
            <span className="meta-field__value">{formatMetaValue(field.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function NestedGroup({ field, depth }: { field: MetaField; depth: number }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="meta-field meta-field--group">
      <button type="button" className="meta-field__group-toggle" onClick={() => setOpen((v) => !v)}>
        <span className={`meta-field__chevron${open ? " meta-field__chevron--open" : ""}`}>▸</span>
        {field.label}
      </button>
      {open && (
        <div className="meta-field__group-body">
          <MetaFieldGroup fields={field.children ?? []} depth={depth + 1} />
        </div>
      )}
    </div>
  );
}
