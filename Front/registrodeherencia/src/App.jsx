import React, { useState } from "react"; // IMPORTANTE: Debe tener { useState }
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
  // Ahora sí, useState funcionará correctamente
  const [activeTab, setActiveTab] = useState("personas");

  return (
    <MetamaskLoader>
      <NotificationProvider>
        <div className="flex min-h-screen bg-[#f3f4f6]">
          {/* Sidebar a la izquierda */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Contenido a la derecha */}
          <div className="flex-1 flex flex-col">
            <Header />
            <DashboardHeader />
            
            <main className="p-8">
              <div className="max-w-7xl mx-auto">
                {activeTab === "personas" && <Personas />}
                {activeTab === "propiedades" && <Propiedad />}
                {activeTab === "herencias" && <Heredero />}
              </div>
            </main>
          </div>
        </div>
      </NotificationProvider>
    </MetamaskLoader>
  );
}

export default App;