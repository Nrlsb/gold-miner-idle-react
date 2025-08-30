// src/components/NotificationComponent.js
import React from 'react';

const Toast = ({ message, type, onDismiss }) => {
    const baseClasses = "max-w-xs w-full rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
    const typeClasses = {
        success: 'bg-green-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type] || 'bg-gray-700'}`}>
            <div className="p-4">
                <p className="text-sm font-medium text-white">{message}</p>
            </div>
        </div>
    );
};


const NotificationComponent = ({ toasts, removeToast }) => {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end z-50 space-y-4"
        >
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

export default NotificationComponent;
