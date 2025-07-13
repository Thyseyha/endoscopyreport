import React, { ReactNode } from 'react';
import { ICONS } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 text-white dark:bg-gray-600 dark:hover:bg-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
    <input id={id} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400" {...props} />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
}
export const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => (
    <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
        <select id={id} className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" {...props}>
            {children}
        </select>
    </div>
);


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
    <textarea id={id} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400" {...props} />
  </div>
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`} {...props}>
    {children}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100">
            {ICONS.close}
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

export const ToggleSwitch: React.FC<{ enabled: boolean, onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`${enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800`}
            role="switch"
            aria-checked={enabled}
        >
            <span
                aria-hidden="true"
                className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
            />
        </button>
    );
};