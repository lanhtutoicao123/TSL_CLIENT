import React from 'react';

interface BuildStep {
  step: number;
  heap: [string, number][];
}

interface Props {
  buildSteps: BuildStep[];
}

export const BuildStepsTable: React.FC<Props> = ({ buildSteps }) => {
  // Tập hợp tất cả symbol từng xuất hiện trong heap
  const uniqueSymbols = Array.from(
    new Set(buildSteps.flatMap((step) => step.heap.map(([symbol]) => symbol)))
  ).sort(); // Sắp xếp cho dễ nhìn

  // Tạo dữ liệu dạng bảng: mỗi dòng là symbol, các cột là stage
  const tableData = uniqueSymbols.map((symbol) => {
    const row = buildSteps.map((step) => {
      const found = step.heap.find(([s]) => s === symbol);
      return found ? found[1].toString() : ''; // Hiển thị frequency hoặc để trống
    });
    return [symbol, ...row];
  });

  return (
    <div className="overflow-auto border rounded shadow-sm mt-4">
      <table className="min-w-full text-sm text-center border-collapse">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th className="border px-3 py-2 bg-white">Symbol</th>
            {buildSteps.map((step) => (
              <th key={step.step} className="border px-3 py-2">
                Stage {step.step}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td key={i} className="border px-3 py-1 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
