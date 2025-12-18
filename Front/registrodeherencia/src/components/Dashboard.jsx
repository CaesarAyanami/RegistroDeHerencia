import React, { useState, useEffect } from 'react';
import { useWeb3 } from './Loader/MetamaskLoader';
import { useNotification } from '../context/NotificationContext';

const DashboardHeader = () => {
  const { account, web3 } = useWeb3();
  const { showNotification } = useNotification();
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const getBalance = async () => {
      if (web3 && account) {
        try {
          const wei = await web3.eth.getBalance(account);
          const eth = web3.utils.fromWei(wei, 'ether');
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
    <div className="bg-slate-50/50 pt-6 pb-2 px-2"> {/* Fondo que se mezcla con el main */}
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* LADO IZQUIERDO: CONTEXTO DEL MÓDULO */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-200 transition-transform hover:rotate-3">
                RH
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                Gestión de Herencias
              </h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-2">
                Protocolo Activo <span className="text-slate-200">|</span> 
                <span className="text-emerald-600">Mainnet Ready</span>
              </p>
            </div>
          </div>

          {/* LADO DERECHO: INFO FINANCIERA Y CUENTA */}
          <div className="flex items-center flex-wrap justify-center gap-4 md:gap-8">
            
            {/* SALDO CON ESTILO DE KPI */}
            <div className="flex flex-col items-center md:items-end border-r border-slate-100 pr-0 md:pr-8 last:border-0">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
                Disponible
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900 tracking-tighter">{balance}</span>
                <span className="text-[10px] font-black text-indigo-500 uppercase">ETH</span>
              </div>
            </div>

            {/* BILLETERA ESTILO "CHIP" */}
            <div 
              onClick={copyAddress}
              className="group flex items-center gap-3 bg-slate-900 p-1.5 pr-4 rounded-xl cursor-pointer transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
            >
              <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center text-white font-mono text-[10px] border border-slate-700 group-hover:border-indigo-500/50 transition-colors">
                {account?.substring(2, 4).toUpperCase()}
              </div>
              
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">
                  Dirección Escrow
                </span>
                <span className="text-[12px] font-mono font-bold text-white tracking-tight">
                  {account?.substring(0, 6)}<span className="opacity-30">...</span>{account?.substring(account.length - 4)}
                </span>
              </div>
              
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs">📋</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;