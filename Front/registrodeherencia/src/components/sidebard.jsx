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
      className={`bg-[#121416] text-white flex flex-col border-r border-gray-800 shadow-2xl h-screen sticky top-0 transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* BOTÓN PARA CONTRAER/EXPANDIR */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-green-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-[0_0_10px_#22c55e] hover:scale-110 transition-transform z-50"
      >
        {isCollapsed ? "→" : "←"}
      </button>

      {/* ÁREA DEL LOGO */}
      <div className={`p-6 border-b border-white/5 mb-6 overflow-hidden whitespace-nowrap`}>
        <div className="flex items-center gap-3">
          <div className="min-w-[40px] h-10 bg-green-500 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center text-black font-black">
            B
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
              <h1 className="text-lg font-black italic tracking-tighter leading-none">BLOCK-LAW</h1>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.3em]">Legal Tech</span>
            </div>
          )}
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="flex-1 px-3 space-y-2 overflow-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? item.label : ""}
            className={`w-full flex items-center rounded-2xl transition-all duration-300 ${
              isCollapsed ? "justify-center px-0 py-4" : "gap-4 px-6 py-4"
            } ${
              activeTab === item.id
                ? "bg-green-600 text-white shadow-[0_10px_25px_rgba(34,197,94,0.3)]"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className={`text-xl ${activeTab === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="font-black text-[10px] uppercase tracking-widest animate-in fade-in duration-500">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* INFO INFERIOR */}
      <div className="p-4">
        <div className={`bg-[#1c1f22] rounded-2xl border border-white/5 transition-all ${isCollapsed ? "p-2" : "p-4"}`}>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            {!isCollapsed && (
              <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">Sistema Activo</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;