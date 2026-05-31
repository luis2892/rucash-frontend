import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  hiddenOnMobile?: boolean;
  align?: 'left' | 'right' | 'center';
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
}

export const ResponsiveTable = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({ columns, data, loading = false, emptyMessage = 'No hay datos', onRowClick }, ref) => {
    const [expandedRow, setExpandedRow] = React.useState<number | null>(null);

    if (loading) {
      return <div className="text-center py-10 text-slate-400 text-sm">Cargando...</div>;
    }

    if (data.length === 0) {
      return <div className="text-center py-10 text-slate-400 text-sm">{emptyMessage}</div>;
    }

    const primaryCol = columns[0];
    const secondaryCol = columns[1];
    const restCols = columns.slice(2);

    return (
      <div ref={ref} className="w-full">
        {/* ── Desktop Table ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-xs font-semibold text-slate-600 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="md:hidden space-y-2">
          {data.map((row, idx) => (
            <div
              key={idx}
              className={`bg-white border border-slate-200 rounded-xl p-4 transition-shadow ${onRowClick ? 'cursor-pointer hover:shadow-md' : ''}`}
              onClick={() => {
                setExpandedRow(expandedRow === idx ? null : idx);
                onRowClick?.(row);
              }}
            >
              {/* Primary + expand toggle */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm">
                    {primaryCol.render ? primaryCol.render(row[primaryCol.key], row) : row[primaryCol.key]}
                  </div>
                  {secondaryCol && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {secondaryCol.label}:{' '}
                      {secondaryCol.render ? secondaryCol.render(row[secondaryCol.key], row) : row[secondaryCol.key]}
                    </div>
                  )}
                </div>
                {restCols.length > 0 && (
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${expandedRow === idx ? 'rotate-180' : ''}`}
                  />
                )}
              </div>

              {/* Expanded rows */}
              {expandedRow === idx && restCols.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  {restCols.map(col => (
                    <div key={col.key}>
                      <p className="text-2xs text-slate-400 mb-0.5">{col.label}</p>
                      <p className="text-xs font-semibold text-slate-800">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ResponsiveTable.displayName = 'ResponsiveTable';
