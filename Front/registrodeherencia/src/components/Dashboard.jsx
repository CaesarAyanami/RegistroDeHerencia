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
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Lado Izquierdo: Info del Proyecto */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
            RH
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-none">Registro de Herencias</h1>
            <span className="text-xs text-green-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Red Conectada
            </span>
          </div>
        </div>

        {/* Lado Derecho: Info de Billetera */}
        <div className="flex items-center gap-4">
          
          {/* Saldo */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tu Saldo</p>
            <p className="text-sm font-mono font-bold text-gray-800">{balance} ETH</p>
          </div>

          {/* Card de Cuenta */}
          <div 
            onClick={copyAddress}
            className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 p-2 pr-4 rounded-full cursor-pointer transition-all active:scale-95"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
              {account?.substring(2, 4).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Billetera</span>
              <span className="text-xs font-mono text-gray-600">
                {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;