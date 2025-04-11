import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ProcessingResult } from './components/ProcessingResult';
import { TabSelector } from './components/TabSelector';
import { FileText } from 'lucide-react';

interface HeapStep {
  step: number;
  heap: [string, number][];
}

interface ProcessingResultData {
  encodedData: string;
  crc: number;
  downloadUrl?: string;
  filename?: string;
  originalSize: number;
  compressedSize: number;
  crcValid: boolean;
  compressionRatio: number;
  codes: Record<string, string>;
  treeImageBase64?: string;
  frequencies?: Record<string, number>;
  probabilities?: Record<string, number>;
  buildSteps?: HeapStep[];
}

interface ApiResponse {
  encodedData: string;
  crc: number;
  downloadUrl?: string;
  filename?: string;
  codes: Record<string, string>;
  tree_image_base64?: string;
  message?: string;
  originalSize?: number;
  frequencies?: Record<string, number>;
  probabilities?: Record<string, number>;
  buildSteps?: { step: number; heap: [string, string | number][] }[];
  build_steps?: { step: number; heap: [string, string | number][] }[];
}

function App() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = activeTab === 'encode' ? '/api/files/upload' : '/api/files/decode';

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Không thể ${activeTab === 'encode' ? 'nén' : 'giải nén'} file: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('📦 Server raw data:', data);

      const buildSteps = data.buildSteps || data.build_steps || [];
      console.log('🧱 buildSteps received:', buildSteps);

      if (!data.encodedData && !data.message) {
        throw new Error('Dữ liệu trả về không đầy đủ');
      }

      const encodedString = data.encodedData;
      const compressedSize = new TextEncoder().encode(encodedString).length;
      const originalSize = file.size;

      const result: ProcessingResultData = {
        encodedData: encodedString,
        crc: data.crc ?? 0,
        downloadUrl: data.downloadUrl,
        filename: data.filename || file.name,
        originalSize,
        compressedSize,
        crcValid: true,
        compressionRatio: originalSize > 0
          ? ((originalSize - compressedSize) / originalSize) * 100
          : 0,
        codes: data.codes || {},
        treeImageBase64: data.tree_image_base64,
        frequencies: data.frequencies || {},
        probabilities: data.probabilities || {},
        buildSteps: buildSteps as HeapStep[],
      };

      setResults(result);
    } catch (err) {
      console.error('❌ Error occurred:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bộ Xử Lý File Huffman</h1>
          <p className="mt-2 text-gray-600">
            Tải lên file để nén hoặc giải nén sử dụng mã hóa Huffman và xác minh CRC
          </p>
        </div>

        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            acceptedTypes={activeTab === 'decode' ? '.huf' : undefined}
            label={activeTab === 'encode'
              ? 'Kéo và thả file để nén'
              : 'Kéo và thả file .huf để giải nén'}
          />
        </div>

        {isProcessing && (
          <div className="mt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">
              {activeTab === 'encode' ? 'Đang nén' : 'Đang giải nén'} file của bạn...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {results && <ProcessingResult {...results} />}
      </div>
    </div>
  );
}

export default App;
