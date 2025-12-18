import React, { useState } from "react";
import { MetamaskLoader } from "./components/Loader/MetamaskLoader";
import { NotificationProvider } from "./context/NotificationContext";

import Sidebar from "./components/sidebard";
import Header from "./components/Header";
import DashboardHeader from "./components/Dashboard";

// Importación de tus módulos
import Personas from "./components/Personas";
import Propiedad from "./components/Propiedad";
import Heredero from "./components/Heredero";

function App() {
  const [activeTab, setActiveTab] = useState("personas");

  return (
    <MetamaskLoader>
      <NotificationProvider>
        {/* CONTENEDOR PRINCIPAL: Ahora con fondo oscuro profundo y tipografía global */}
        <div className="flex min-h-screen bg-[#050608] text-white font-sans selection:bg-blue-500/30">
          {/* TEXTURA DE FONDO (Opcional para dar profundidad) */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
          </div>

          {/* SIDEBAR: Se mantiene a la izquierda */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* CONTENIDO DERECHA: Ajustado para el scroll técnico */}
          <div className="flex-1 flex flex-col relative z-10">
            {/* Header Superior */}
            <Header />

            {/* Contenedor con scroll interno para no perder el Header de vista */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Dashboard Info Header */}
              <DashboardHeader />

              <main className="p-8 pb-20">
                <div className="max-w-7xl mx-auto">
                  {/* TRANSICIÓN DE PESTAÑAS: Usando animaciones sutiles */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === "personas" && <Personas />}
                    {activeTab === "propiedades" && <Propiedad />}
                    {activeTab === "herencias" && <Heredero />}
                  </div>
                </div>
              </main>

              {/* FOOTER TÉCNICO SUTIL */}
              <footer className="p-8 border-t border-white/5 flex justify-between items-center opacity-30">
                <span className="text-[8px] font-black uppercase tracking-[0.5em]">
                  Ledger Protocol v2.0.5
                </span>
                <div className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase tracking-[0.5em]">
                    Network: Mainnet Node
                  </span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </NotificationProvider>
    </MetamaskLoader>
  );
}

export default App;
