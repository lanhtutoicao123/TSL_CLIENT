import React, { useState, useMemo, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { BuildStepsTable } from './BuildStepsTable';

interface BuildStep {
  step: number;
  heap: [string, number][];
}

interface SymbolInfo {
  symbol: string;
  frequency: number;
  probability: number;
  codeword: string;
  length: number;
}

interface ProcessingResultProps {
  encodedData: string;
  crc: number;
  originalSize?: number;
  compressedSize?: number;
  crcValid?: boolean;
  compressionRatio?: number;
  downloadUrl?: string;
  filename?: string;
  codes?: Record<string, string>;
  treeImageBase64?: string;
  frequencies?: Record<string, number>;
  probabilities?: Record<string, number>;
  buildSteps?: BuildStep[];
  symbolRate?: number;
}

export const ProcessingResult: React.FC<ProcessingResultProps> = ({
  encodedData,
  crc,
  originalSize,
  compressedSize,
  crcValid = true,
  compressionRatio,
  downloadUrl,
  filename,
  codes = {},
  treeImageBase64,
  frequencies = {},
  probabilities = {},
  buildSteps = [],
  symbolRate = 1,
}) => {
  const [showTree, setShowTree] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const symbolTable: SymbolInfo[] = useMemo(() => {
    return Object.entries(frequencies).map(([symbol, frequency]) => {
      const probability = probabilities[symbol] || 0;
      const codeword = codes[symbol] || '';
      return {
        symbol,
        frequency,
        probability,
        codeword,
        length: codeword.length,
      };
    });
  }, [frequencies, probabilities, codes]);

  const entropy = useMemo(
    () => symbolTable.reduce(
      (sum, { probability }) => sum + probability * Math.log2(1 / probability),
      0
    ),
    [symbolTable]
  );

  const avgLength = useMemo(
    () => symbolTable.reduce(
      (sum, { probability, length }) => sum + probability * length,
      0
    ),
    [symbolTable]
  );

  const variance = useMemo(
    () => symbolTable.reduce(
      (sum, { probability, length }) => sum + probability * Math.pow(length - avgLength, 2),
      0
    ),
    [symbolTable, avgLength]
  );

  const efficiency = entropy / (avgLength || 1);
  const bitRate = symbolRate * avgLength;

  const formattedCompressionRatio = !isNaN(compressionRatio ?? NaN)
    ? `${compressionRatio!.toFixed(2)}%`
    : 'N/A';

  useEffect(() => {
    console.log('📦 buildSteps:', buildSteps);
  }, [buildSteps]);

  return (
    <div className="mt-8 p-6 border rounded-lg bg-white shadow-md">
      <h3 className="text-lg font-semibold text-gray-800">Kết quả xử lý</h3>

      <div className="mt-4 space-y-2">
        {filename && <InfoRow label="Tên tệp" value={filename} />}
        {originalSize !== undefined && <InfoRow label="Kích thước gốc" value={`${originalSize} bytes`} />}
        {compressedSize !== undefined && <InfoRow label="Kích thước đã nén" value={`${compressedSize} bytes`} />}
        <InfoRow label="Tỷ lệ nén" value={formattedCompressionRatio} />
        <InfoRow label="CRC hợp lệ" value={crcValid ? 'Hợp lệ' : 'Không hợp lệ'} />
        <InfoRow label="CRC" value={crc.toString()} />

        <div>
          <label className="font-medium text-gray-600 block mb-1">Encoded Data:</label>
          <div className="bg-gray-100 p-2 rounded text-sm font-mono break-words max-h-60 overflow-y-auto">
            {encodedData}
          </div>
        </div>

        {downloadUrl && (
          <div className="mt-4 text-center">
            <a
              href={downloadUrl}
              download
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tải file đã nén
            </a>
          </div>
        )}

        {treeImageBase64 && (
          <ToggleSection label="Hiển thị cây Huffman" toggled={showTree} onToggle={setShowTree}>
            <img
              src={`data:image/png;base64,${treeImageBase64}`}
              alt="Cây Huffman"
              className="max-w-full border rounded shadow mt-4"
            />
          </ToggleSection>
        )}

        {symbolTable.length > 0 && (
          <ToggleSection label="Hiển thị bảng mã & thống kê" toggled={showTable} onToggle={setShowTable}>
            <div className="overflow-x-auto mt-4 space-y-4">
              <table className="min-w-full border border-gray-300 text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">Ký tự</th>
                    <th className="border px-2 py-1">Tần số</th>
                    <th className="border px-2 py-1">Xác suất</th>
                    <th className="border px-2 py-1">Codeword</th>
                    <th className="border px-2 py-1">Độ dài</th>
                  </tr>
                </thead>
                <tbody>
                  {symbolTable.map(({ symbol, frequency, probability, codeword, length }) => (
                    <tr key={symbol}>
                      <td className="border px-2 py-1">{symbol === ' ' ? '␣ (space)' : symbol}</td>
                      <td className="border px-2 py-1">{frequency}</td>
                      <td className="border px-2 py-1">{probability.toFixed(4)}</td>
                      <td className="border px-2 py-1 font-mono">{codeword}</td>
                      <td className="border px-2 py-1">{length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-sm text-gray-700 space-y-1">
                <div><strong>Entropy (H):</strong> {entropy.toFixed(4)} bits/symbol</div>
                <div><strong>Chiều dài trung bình (N):</strong> {avgLength.toFixed(4)} bits/symbol</div>
                <div><strong>Phương sai (σ²):</strong> {variance.toFixed(4)}</div>
                <div><strong>Hiệu suất mã hóa (h):</strong> {(efficiency * 100).toFixed(2)}%</div>
                <div><strong>Bit rate (Rᵦ):</strong> {bitRate.toFixed(4)} bps (Rs = {symbolRate} symbols/s)</div>
              </div>
            </div>
          </ToggleSection>
        )}

        {buildSteps.length > 0 && (
          <ToggleSection
            label="Hiển thị trạng thái symbol qua từng bước"
            toggled={showSteps}
            onToggle={setShowSteps}
          >
            <BuildStepsTable buildSteps={buildSteps} />
          </ToggleSection>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="font-medium text-gray-600">{label}:</span>
    <span>{value}</span>
  </div>
);

const ToggleSection = ({
  label,
  toggled,
  onToggle,
  children,
}: {
  label: string;
  toggled: boolean;
  onToggle: (checked: boolean) => void;
  children: React.ReactNode;
}) => (
  <div className="mt-6">
    <div className="flex items-center justify-between">
      <span className="font-medium text-gray-600">{label}:</span>
      <Switch checked={toggled} onCheckedChange={onToggle} />
    </div>
    {toggled && <div className="mt-2">{children}</div>}
  </div>
);
