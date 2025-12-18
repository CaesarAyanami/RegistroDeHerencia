import React, { useState, useCallback, useMemo, useEffect } from "react";
import { MetamaskLoader } from "./components/Loader/MetamaskLoader";
import { NotificationProvider } from "./context/NotificationContext";

import Sidebar from "./components/sidebard"; 
import Header from "./components/Header";

// Importación de tus módulos
import Personas from "./components/Personas";
import Propiedad from "./components/Propiedad";
import Heredero from "./components/Heredero";

function App() {
  const [activeTab, setActiveTab] = useState("personas");
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia desde localStorage o detectar preferencia del sistema
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicar modo oscuro al elemento raíz del documento
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleTabChange = useCallback((tab) => {
    try {
      setActiveTab(tab);
    } catch (error) {
      console.error("Error al cambiar de pestaña:", error);
    }
  }, []);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case "personas":
        return <Personas />;
      case "propiedades":
        return <Propiedad />;
      case "herencias":
        return <Heredero />;
      default:
        return <Personas />;
    }
  }, [activeTab]);

  return (
    <MetamaskLoader>
      <NotificationProvider>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {/* Pasar darkMode y setDarkMode al Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              <div className="max-w-[1400px] mx-auto w-full">
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {renderContent}
                </div>
              </div>
            </main>

            <footer className="py-3 px-4 md:px-6 border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="max-w-[1400px] mx-auto w-full">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-bold uppercase tracking-wider">
                  Sistema de Gestión Legal Blockchain • Universidad Internacional Jesús Obrero
                </p>
              </div>
            </footer>
          </div>
        </div>
      </NotificationProvider>
    </MetamaskLoader>
  );
}

export default App;