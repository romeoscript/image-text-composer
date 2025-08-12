import React from 'react';

interface FontSelectorProps {
  label?: string;
  value: string;
  onChange: (font: string) => void;
  className?: string;
  fonts?: string[];
}

const DEFAULT_FONTS = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Impact, sans-serif',
  'Comic Sans MS, cursive',
  'Courier New, monospace',
  'Lucida Console, monospace',
  'Palatino, serif',
  'Garamond, serif',
  'Bookman, serif',
  'Avant Garde, sans-serif',
];

export const FontSelector: React.FC<FontSelectorProps> = ({
  label,
  value,
  onChange,
  className = '',
  fonts = DEFAULT_FONTS,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {fonts.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font.split(',')[0]}
          </option>
        ))}
      </select>
    </div>
  );
}; 