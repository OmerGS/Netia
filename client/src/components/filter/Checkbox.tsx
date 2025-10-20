import React from 'react';

type CheckboxProps = {
  label: string;
  isChecked: boolean;
  onChange: () => void;
  disabled: boolean;
}

export const Checkbox = ({ label, isChecked, onChange, disabled }: CheckboxProps) => (
  <label className={`
    flex items-center space-x-2 cursor-pointer 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-700'}
  `}>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      disabled={disabled}
      className="
        h-4 w-4 rounded border-gray-300 text-blue-600 
        focus:ring-blue-500 focus:ring-offset-0 focus:ring-2
        disabled:bg-gray-200
      "
    />
    <span className="text-sm text-gray-700 select-none">
      {label}
    </span>
  </label>
);