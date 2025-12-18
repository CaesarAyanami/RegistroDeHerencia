import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";

// 1. Envolvemos en React.memo para evitar re-renders si las props no cambian
const Sidebar = React.memo(({ activeTab, setActiveTab, darkMode, setDarkMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [balance, setBalance] = useState("0.0000");
  const { account, web3 } = useWeb3();
  const { showNotification } = useNotification();

  // 2. Memorizamos menuItems para que la referencia sea estable
  const menuItems = useMemo(() => [
    { id: "personas", label: "Registro Civil", icon: "👤" },
    { id: "propiedades", label: "Activos Digitales", icon: "🏠" },
    { id: "herencias", label: "Gestión Hereditaria", icon: "⚖️" },
  ], []);

  // 3. Obtener balance con manejo de errores robusto y limpieza
  useEffect(() => {
    let isMounted = true;

    const getBalance = async () => {
      if (!web3 || !account) return;
      
      try {
        const wei = await web3.eth.getBalance(account);
        const eth = web3.utils.fromWei(wei, "ether");
        if (isMounted) {
          setBalance(parseFloat(eth).toFixed(4));
        }
      } catch (error) {
        console.error("Error balance:", error);
        showNotification("No se pudo sincronizar el balance de la billetera", "error");
      }
    };

    getBalance();
    return () => { isMounted = false; }; // Cleanup para evitar fugas
  }, [account, web3, showNotification]);

  // 4. Memorizamos funciones de interacción
  const copyAddress = useCallback(() => {
    if (account) {
      try {
        navigator.clipboard.writeText(account);
        showNotification("Dirección copiada al portapapeles", "info");
      } catch (err) {
        showNotification("Error al copiar la dirección", "error");
      }
    } else {
      showNotification("No hay una cuenta activa para copiar", "warning");
    }
  }, [account, showNotification]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
    // Aquí también puedes agregar para guardar en localStorage
    localStorage.setItem('darkMode', !darkMode);
  }, [setDarkMode, darkMode]);

  return (
    <aside
      className={`transition-all duration-300 ease-in-out sticky top-0 h-screen flex flex-col z-[100] 
        ${isCollapsed ? "w-16 md:w-20" : "w-56 md:w-64"} 
        bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-sm`}
    >
      {/* BOTÓN COLAPSAR */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-2 md:-right-3 top-8 md:top-10 bg-emerald-600 dark:bg-emerald-500 text-white w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-[110] focus:ring-2 focus:ring-emerald-400 focus:outline-none"
        aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        <span className="text-[8px] md:text-[10px] font-bold">{isCollapsed ? "→" : "←"}</span>
      </button>

      {/* LOGO SECCIÓN */}
      <div className="p-3 md:p-4 mb-2 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="min-w-[28px] md:min-w-[32px] h-7 md:h-8 bg-emerald-600 dark:bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/20">
            B
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter">
                BLOCK-LAW
              </h1>
              <p className="text-[8px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
                Protocol
              </p>
            </div>
          )}
        </div>
      </div>

      {/* WALLET INFO CHIP */}
      {!isCollapsed && (
        <div className="px-3 md:px-4 mb-4 md:mb-6">
          <div 
            onClick={copyAddress}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-2 md:p-3 rounded-lg cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors duration-300 group"
          >
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center text-[8px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                0x
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 truncate">
                {account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : "No Wallet"}
              </span>
            </div>
            <div className="pt-1 border-t border-gray-100 dark:border-gray-600 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{balance} ETH</span>
              <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">📋</span>
            </div>
          </div>
        </div>
      )}

      {/* NAVEGACIÓN */}
      <nav className="flex-1 px-1 md:px-2 space-y-0.5 md:space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center rounded-lg transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:outline-none
              ${isCollapsed ? "justify-center py-2 md:py-3" : "gap-2 md:gap-3 px-2 md:px-3 py-2"} 
              ${activeTab === item.id 
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"}`}
            aria-label={isCollapsed ? item.label : ""}
          >
            <span className="text-base md:text-lg">{item.icon}</span>
            {!isCollapsed && (
              <span className="text-xs md:text-[13px] font-semibold tracking-tight">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-2 md:p-3 border-t border-gray-100 dark:border-gray-700 space-y-2 md:space-y-3">
        {/* Botón Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none
            bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
            text-gray-600 dark:text-gray-400 hover:border-emerald-400 dark:hover:border-emerald-500
            ${isCollapsed ? "justify-center" : "px-2 md:px-3"}`}
          aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          <span className="text-base md:text-lg">{darkMode ? "☀️" : "🌙"}</span>
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {darkMode ? "Modo Día" : "Modo Noche"}
            </span>
          )}
        </button>

        {/* Status de red */}
        <div className={`flex items-center gap-1.5 md:gap-2 ${isCollapsed ? "justify-center" : "px-1 md:px-2"}`}>
          <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
          {!isCollapsed && (
            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Mainnet Verified
            </span>
          )}
        </div>
      </div>
    </aside>
  );
});

export default Sidebar;