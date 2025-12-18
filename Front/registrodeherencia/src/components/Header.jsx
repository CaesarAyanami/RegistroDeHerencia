import React from "react";
import logo from "../assets/IUJOLOGO.png";

export default function Header() {
  return (
    /* ESTRUCTURA DE POSICIONAMIENTO:
       - sticky top-0: Se queda en la cima.
       - z-[90]: Un nivel por debajo del DashboardHeader (si están juntos) o prioridad alta.
       - bg-[#0d0f14]/80: Fondo oscuro coherente con el resto de la DApp.
    */
    <header className="sticky top-0 z-[90] flex items-center justify-between p-4 md:px-8 md:py-5 bg-[#0d0f14]/80 backdrop-blur-xl text-white shadow-2xl border-b border-white/5">
      {/* DECORACIÓN DE FONDO SUTIL */}
      <div className="absolute top-0 left-1/4 w-32 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

      <div className="flex items-center space-x-6">
        {/* CONTENEDOR LOGO ESTILIZADO */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-white/5 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10">
            <img
              src={logo}
              alt="Logo Universidad"
              className="h-10 md:h-12 w-auto grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>

        {/* TÍTULO PRINCIPAL */}
        <div className="hidden sm:block">
          <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">
            Panel de{" "}
            <span className="text-blue-500 text-outline-sm">Control</span>
          </h1>
          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.5em] mt-0.5">
            Legacy Management System
          </p>
        </div>
      </div>

      {/* ELEMENTOS LADO DERECHO */}
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-black italic uppercase tracking-tighter sm:hidden">
          Panel
        </h2>

        {/* ICONO BLOCKCHAIN ESTILIZADO */}
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
          <span
            className="relative text-2xl md:text-3xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            title="Blockchain Icon"
            role="img"
            aria-label="collision"
          >
            &#128165;
          </span>
        </div>
      </div>
    </header>
  );
}
