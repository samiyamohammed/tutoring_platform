import React from 'react';

function Toast({ title, message, type }) {
  const bgColor = {
    success: 'bg-green-100 dark:bg-green-900',
    error: 'bg-red-100 dark:bg-red-900',
    warning: 'bg-yellow-100 dark:bg-yellow-900',
    info: 'bg-blue-100 dark:bg-blue-900',
  }[type];

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-md ${bgColor}`}>
      <div className="flex items-center">
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Toast;