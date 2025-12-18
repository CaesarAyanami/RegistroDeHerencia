import React, { useState } from "react";

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "personas", label: "Registro Civil", icon: "👤" },
    { id: "propiedades", label: "Activos Digitales", icon: "🏠" },
    { id: "herencias", label: "Gestión Hereditaria", icon: "⚖️" },
  ];

  return (
    <aside
      className={`bg-[#0d0f14] text-white flex flex-col border-r border-white/5 shadow-2xl h-screen sticky top-0 transition-all duration-500 ease-in-out z-[1000] ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* BOTÓN PARA CONTRAER/EXPANDIR ESTILIZADO */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-110 transition-transform z-[1001] border border-blue-400/50"
      >
        {isCollapsed ? "→" : "←"}
      </button>

      {/* ÁREA DEL LOGO - Estética Industrial */}
      <div
        className={`p-8 border-b border-white/5 mb-6 overflow-hidden whitespace-nowrap`}
      >
        <div className="flex items-center gap-4">
          <div className="min-w-[42px] h-[42px] bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center text-white font-black italic border border-white/10">
            B
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-xl font-black italic tracking-tighter leading-none text-white">
                BLOCK-LAW
              </h1>
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] mt-1 block">
                Protocolo Legal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* NAVEGACIÓN - Botones con Glow Dinámico */}
      <nav className="flex-1 px-4 space-y-3 overflow-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? item.label : ""}
            className={`w-full flex items-center rounded-2xl transition-all duration-300 group relative ${
              isCollapsed ? "justify-center px-0 py-4" : "gap-4 px-6 py-4"
            } ${
              activeTab === item.id
                ? "bg-blue-600/10 text-white border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.1)]"
                : "text-gray-500 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            {/* Indicador lateral activo */}
            {activeTab === item.id && (
              <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]"></div>
            )}

            <span
              className={`text-xl transition-transform duration-300 ${
                activeTab === item.id
                  ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
              }`}
            >
              {item.icon}
            </span>

            {!isCollapsed && (
              <span
                className={`font-black text-[10px] uppercase tracking-[0.2em] animate-in fade-in duration-700 ${
                  activeTab === item.id
                    ? "text-white"
                    : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* INFO INFERIOR - Status de Red */}
      <div className="p-6">
        <div
          className={`bg-black/40 rounded-2xl border border-white/5 transition-all ${
            isCollapsed ? "p-3" : "px-5 py-4"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
            {!isCollapsed && (
              <div className="text-left overflow-hidden">
                <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">
                  Sistema Activo
                </p>
                <p className="text-[6px] text-blue-500/60 font-bold uppercase tracking-[0.2em]">
                  Node synced
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
