import React, { useState, useEffect } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";

const DashboardHeader = () => {
  const { account, web3 } = useWeb3();
  const { showNotification } = useNotification();
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const getBalance = async () => {
      if (web3 && account) {
        try {
          const wei = await web3.eth.getBalance(account);
          const eth = web3.utils.fromWei(wei, "ether");
          setBalance(parseFloat(eth).toFixed(4));
        } catch (error) {
          console.error("Error obteniendo saldo", error);
        }
      }
    };
    getBalance();
  }, [account, web3]);

  const copyAddress = () => {
    navigator.clipboard.writeText(account);
    showNotification("Dirección copiada al portapapeles", "info");
  };

  return (
    /* CLAVES DEL DISEÑO:
       - 'sticky top-0': Hace que se quede arriba al scrollear.
       - 'z-[100]': Asegura que el contenido pase por DEBAJO.
       - 'bg-[#0d0f14]/80 backdrop-blur-xl': Estilo traslúcido Dark Tech.
    */
    <header className="sticky top-0 z-[100] bg-[#0d0f14]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 shadow-2xl shadow-black/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Lado Izquierdo: Info del Proyecto (Estilo Dark Tech) */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#1a1c1e] to-black border border-white/10 rounded-2xl flex items-center justify-center text-white font-black italic shadow-2xl">
              RH
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
              Registro de Herencias
            </h1>
            <span className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              Protocolo Activo
            </span>
          </div>
        </div>

        {/* Lado Derecho: Info de Billetera (Cyberpunk Ledger) */}
        <div className="flex items-center gap-8">
          {/* Saldo con estilo Tech */}
          <div className="text-right hidden sm:block border-r border-white/5 pr-8">
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.3em] mb-1">
              Balance Ledger
            </p>
            <p className="text-lg font-black text-white italic tracking-tight">
              {balance} <span className="text-blue-500 text-sm">ETH</span>
            </p>
          </div>

          {/* Card de Cuenta (Cápsula de Identidad) */}
          <div
            onClick={copyAddress}
            className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/5 p-2 pr-6 rounded-2xl cursor-pointer transition-all active:scale-95"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-sm opacity-0 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-xl text-outline-sm">
                {account?.substring(2, 4).toUpperCase()}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-0.5">
                Identidad Digital
              </span>
              <span className="text-xs font-mono font-bold text-gray-300 group-hover:text-white transition-colors">
                {account?.substring(0, 6)}
                <span className="opacity-30">...</span>
                {account?.substring(account.length - 4)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
