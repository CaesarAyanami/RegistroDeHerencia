import React, { memo } from "react";
import logo from "../assets/IUJOLOGO.png";

const Header = memo(function Header() {
  
  const handleLogoError = () => {
    console.error("Error al cargar el logo del Header.");
  };

  return (
    <header className="sticky top-0 z-[90] flex items-center justify-between p-4 md:px-8 md:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100/60 dark:border-gray-700/60 shadow-sm transition-all duration-300">
      
      {/* SECCIÓN IZQUIERDA: LOGO Y TÍTULO */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hover:scale-105 transition-transform duration-300">
          <img 
            src={logo} 
            alt="Logo Universidad" 
            onError={handleLogoError}
            className="h-8 md:h-10 lg:h-12 w-auto object-contain drop-shadow-sm" 
          />
        </div>
        
        {/* Separador con degradado - Solo en desktop */}
        <div className="h-6 md:h-8 w-[1px] bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent hidden md:block"></div>
        
        {/* Texto del título - Oculto en móvil, visible en desktop */}
        <div className="flex-col hidden md:flex">
          <h1 className="text-base md:text-lg lg:text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight leading-none">
            Legacy Chain
          </h1>
          <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1">
            Sistema de Gestión De Herencias
          </span>
        </div>
      </div>

      {/* SECCIÓN DERECHA: STATUS DE RED */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Versión móvil del título */}
        <h2 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider md:hidden">
          Panel Blockchain
        </h2>
        
        {/* Badge de Red Blockchain */}
        <div className="group flex items-center gap-2 md:gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm transition-all duration-300 cursor-pointer">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-none mb-0.5">
              Estado de Red
            </span>
            <span className="text-[10px] md:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline tracking-wide">
              Ganache Network
            </span>
          </div>
          
          <div className="relative flex items-center justify-center">
            <span className="text-lg md:text-xl group-hover:rotate-12 transition-transform duration-300">🌐</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 dark:bg-emerald-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
          </div>
        </div>
      </div>

    </header>
  );
});

export default Header;