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
      {/* Contenedor: Movido un poco más hacia adentro y con espacio dinámico */}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 w-full max-w-[350px] pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto overflow-hidden">
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

  // Estilos basados en la nueva paleta de colores técnica
  const styles = {
    success: {
      bg: "bg-emerald-950/90",
      border: "border-emerald-500/50",
      icon: "text-emerald-400",
      accent: "bg-emerald-500"
    },
    error: {
      bg: "bg-red-950/90",
      border: "border-red-500/50",
      icon: "text-red-400",
      accent: "bg-red-500"
    },
    info: {
      bg: "bg-slate-900/90",
      border: "border-indigo-500/50",
      icon: "text-indigo-400",
      accent: "bg-indigo-500"
    },
    alert: {
      bg: "bg-amber-950/90",
      border: "border-amber-500/50",
      icon: "text-amber-400",
      accent: "bg-amber-500"
    },
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    alert: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className={`
      ${currentStyle.bg} backdrop-blur-md
      ${currentStyle.border} border
      text-white p-4 rounded-2xl shadow-2xl
      flex items-start gap-4 
      animate-in fade-in slide-in-from-right-8 duration-300
      relative overflow-hidden
    `}>
      {/* Barra de acento lateral interna */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${currentStyle.accent}`}></div>

      <div className={`flex-shrink-0 mt-0.5 ${currentStyle.icon}`}>
        {icons[type]}
      </div>

      <div className="flex-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">
          Notificación del Sistema
        </h4>
        <p className="text-sm font-bold text-slate-100 leading-tight">
          {message}
        </p>
      </div>

      <button 
        onClick={onClose} 
        className="text-slate-500 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};