import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeNotification(id), duration);
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* CONTENEDOR DE NOTIFICACIONES */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4 w-full max-w-[320px] pointer-events-none">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationItem
              notification={n}
              onClose={() => removeNotification(n.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

const NotificationItem = ({ notification, onClose }) => {
  const { message, type } = notification;

  // ESTILOS BASADOS EN TU PALETA ON-CHAIN
  const styles = {
    success:
      "border-green-500/30 bg-[#0d0f14]/90 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]",
    error:
      "border-red-500/30 bg-[#0d0f14]/90 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
    info: "border-blue-500/30 bg-[#0d0f14]/90 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
    alert:
      "border-amber-500/30 bg-[#0d0f14]/90 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    alert: "⚠",
  };

  return (
    <div
      className={`
      ${styles[type] || styles.info} 
      backdrop-blur-md p-5 rounded-2xl border-l-2 border-y border-r
      flex items-start justify-between 
      animate-in slide-in-from-right-full duration-300
      relative overflow-hidden group
    `}
    >
      {/* BARRA DE PROGRESO DECORATIVA (OPCIONAL) */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] bg-current opacity-20 animate-shrink-width`}
      />

      <div className="flex items-start gap-4">
        <span
          className={`
          flex items-center justify-center min-w-[24px] h-6 
          rounded-lg text-[10px] font-black border border-current/20
        `}
        >
          {icons[type]}
        </span>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-50 italic">
            System Message
          </span>
          <p className="font-bold text-[11px] leading-tight tracking-tight text-white/90">
            {message}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-white transition-colors text-xl leading-none font-light"
      >
        &times;
      </button>
    </div>
  );
};
