import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Contenedor en la esquina inferior derecha */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-xs pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
             <NotificationItem notification={n} onClose={() => removeNotification(n.id)} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

const NotificationItem = ({ notification, onClose }) => {
  const { message, type } = notification;

  const styles = {
    success: "bg-green-600 border-green-700 shadow-green-900/20",
    error: "bg-red-600 border-red-700 shadow-red-900/20",
    info: "bg-blue-600 border-blue-700 shadow-blue-900/20",
    alert: "bg-amber-500 border-amber-600 shadow-amber-900/20",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    alert: "⚠",
  };

  return (
    <div className={`
      ${styles[type] || styles.info} 
      text-white p-4 rounded-xl shadow-xl border-l-4 
      flex items-center justify-between 
      animate-slide-in-right
    `}>
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-xs font-bold">
          {icons[type]}
        </span>
        <p className="font-semibold text-sm">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 text-xl font-bold">
        &times;
      </button>
    </div>
  );
};