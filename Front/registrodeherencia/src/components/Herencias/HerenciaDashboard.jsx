import React, { useState, useEffect } from "react";
import Web3 from "web3";
// ABI del nuevo contrato RegistroHerencias
import HerenciaABI from "../ABI/RegistroHerencias.json"; 
// Necesitaremos consultar Propiedades para mostrar info
import PropiedadesABI from "../ABI/Propiedades.json"; 

import DefinirHerencia from "./DefinirHerencia";
import EjecutarHerencia from "./EjecutarHerencia";
import ConsultarPlan from "./ConsultarPlan";

const HerenciaDashboard = () => {
  const [account, setAccount] = useState("");
  const [contracts, setContracts] = useState({ herencia: null, propiedades: null });

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        
        // Instancia Herencias
        const herenciaNet = HerenciaABI.networks[networkId];
        const herenciaInst = herenciaNet ? new web3.eth.Contract(HerenciaABI.abi, herenciaNet.address) : null;
        
        // Instancia Propiedades (para consultas de info)
        const propNet = PropiedadesABI.networks[networkId];
        const propInst = propNet ? new web3.eth.Contract(PropiedadesABI.abi, propNet.address) : null;

        setContracts({ herencia: herenciaInst, propiedades: propInst });
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="border-b pb-6">
          <h1 className="text-3xl font-black italic text-gray-900">SISTEMA DE HERENCIAS v2</h1>
          <p className="text-sm text-gray-500 font-mono">Conectado: {account}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DefinirHerencia contract={contracts.herencia} account={account} />
          <div className="space-y-8">
            <EjecutarHerencia contract={contracts.herencia} account={account} />
            <ConsultarPlan contract={contracts.herencia} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerenciaDashboard;