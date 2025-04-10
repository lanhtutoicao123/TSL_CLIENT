import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch"; 

interface ProcessingResultProps {
  originalSize?: number;
  compressedSize?: number;
  crcValid?: boolean;
  compressionRatio?: number;
  downloadUrl?: string;
  filename?: string;
  encodedData: string;
  crc: number;
  treeImageBase64?: string; 
}

export const ProcessingResult: React.FC<ProcessingResultProps> = ({
  originalSize,
  compressedSize,
  crcValid,
  compressionRatio,
  downloadUrl,
  filename,
  encodedData,
  crc,
  treeImageBase64,
}) => {
  const formattedCompressionRatio = !isNaN(compressionRatio ?? NaN)
    ? compressionRatio!.toFixed(2)
    : 'N/A';

  const [showTree, setShowTree] = useState(false);

  return (
    <div className="mt-8 p-6 border rounded-lg bg-white shadow-md">
      <h3 className="text-lg font-semibold text-gray-800">Kết quả xử lý</h3>

      <div className="mt-4 space-y-2">
        {filename && (
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Tên tệp:</span>
            <span>{filename}</span>
          </div>
        )}
        {originalSize !== undefined && (
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Kích thước gốc:</span>
            <span>{originalSize} bytes</span>
          </div>
        )}
        {compressedSize !== undefined && (
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Kích thước đã nén:</span>
            <span>{compressedSize} bytes</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">Tỷ lệ nén:</span>
          <span>{formattedCompressionRatio}%</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">CRC hợp lệ:</span>
          <span>{crcValid ? 'Hợp lệ' : 'Không hợp lệ'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-gray-600">CRC:</span>
          <span>{crc}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600 block mb-1">Encoded Data:</span>
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

        {/* Toggle tree image */}
        {treeImageBase64 && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-600">Hiển thị cây Huffman:</label>
              <Switch checked={showTree} onCheckedChange={setShowTree} />
              {}
            </div>

            {showTree && (
              <div className="mt-4">
                <img
                  src={`data:image/png;base64,${treeImageBase64}`}
                  alt="Huffman Tree"
                  className="max-w-full border rounded shadow"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
