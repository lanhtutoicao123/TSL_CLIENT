import React from 'react';

interface TabSelectorProps {
  activeTab: 'encode' | 'decode';
  onTabChange: (tab: 'encode' | 'decode') => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1">
      <button
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors
          ${activeTab === 'encode'
            ? 'bg-white text-gray-900 shadow'
            : 'text-gray-500 hover:text-gray-700'
          }`}
        onClick={() => onTabChange('encode')}
      >
        Encode
      </button>
      <button
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors
          ${activeTab === 'decode'
            ? 'bg-white text-gray-900 shadow'
            : 'text-gray-500 hover:text-gray-700'
          }`}
        onClick={() => onTabChange('decode')}
      >
        Decode
      </button>
    </div>
  );
}