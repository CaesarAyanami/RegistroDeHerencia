import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HerenciaABI from "../ABI/RegistroPropiedadesHerencia.json";
import { HERENCIA_ADDRESS } from "../config";

export default function DAppPersonaHerencia() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [datosContrato, setDatosContrato] = useState(null);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // --- LÓGICA WEB3 INTACTA ---
  const loadWeb3Data = async (web3Instance, accs) => {
    if (!accs || accs.length === 0) {
      setError("MetaMask no conectada o cuenta no seleccionada.");
      setAccounts([]);
      setSelectedAccount("");
      setContract(null);
      setDatosContrato(null);
      return;
    }

    const instance = new web3Instance.eth.Contract(
      HerenciaABI.abi,
      HERENCIA_ADDRESS
    );

    setWeb3(web3Instance);
    setAccounts(accs);
    setSelectedAccount(accs[0]);
    setContract(instance);
    setError(null);

    try {
      const datos = await instance.methods.obtenerDatosContrato().call();
      setDatosContrato(datos);
    } catch (e) {
      console.error("Error al cargar datos del contrato:", e);
      setError("Error al leer datos del contrato. Verifique red y dirección.");
      setDatosContrato(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        setError("MetaMask no detectado. Instale el plugin.");
        return;
      }
      const web3Instance = new Web3(window.ethereum);
      try {
        const accs = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        await loadWeb3Data(web3Instance, accs);

        const handleAccountsChanged = (newAccounts) =>
          loadWeb3Data(web3Instance, newAccounts);
        const handleChainChanged = () => window.location.reload();

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
          if (window.ethereum.removeListener) {
            window.ethereum.removeListener(
              "accountsChanged",
              handleAccountsChanged
            );
            window.ethereum.removeListener("chainChanged", handleChainChanged);
          }
        };
      } catch (e) {
        setError("Error al conectar con MetaMask. Revise permisos.");
      }
    };
    init();
  }, []);

  const refreshDatos = async () => {
    if (!contract) return;
    try {
      const datos = await contract.methods.obtenerDatosContrato().call();
      setDatosContrato(datos);
    } catch (e) {
      console.error("Error al refrescar:", e);
    }
  };

  const withGasPrice = async () => {
    if (!web3) throw new Error("Web3 no inicializado");
    return await web3.eth.getGasPrice();
  };

  // --- ACCIONES INTACTAS ---
  const activarPrueba = async () => {
    if (!contract || !selectedAccount) return;
    setLoadingAction(true);
    try {
      const gasPrice = await withGasPrice();
      await contract.methods
        .activarPruebaFallecimiento()
        .send({ from: selectedAccount, gasPrice });
      alert("✅ Prueba de fallecimiento activada");
      await refreshDatos();
    } catch (err) {
      alert("❌ Error al activar prueba");
    } finally {
      setLoadingAction(false);
    }
  };

  const reclamarHerencia = async () => {
    if (!contract || !selectedAccount) return;
    setLoadingAction(true);
    try {
      const gasPrice = await withGasPrice();
      await contract.methods
        .reclamarHerencia()
        .send({ from: selectedAccount, gasPrice });
      alert("✅ Herencia reclamada");
      await refreshDatos();
    } catch (err) {
      alert("❌ Error al reclamar");
    } finally {
      setLoadingAction(false);
    }
  };

  const retirarFondos = async () => {
    if (!contract || !selectedAccount) return;
    setLoadingAction(true);
    try {
      const gasPrice = await withGasPrice();
      await contract.methods
        .retirarFondos()
        .send({ from: selectedAccount, gasPrice });
      alert("✅ Fondos retirados");
      await refreshDatos();
    } catch (err) {
      alert("❌ Error al retirar");
    } finally {
      setLoadingAction(false);
    }
  };

  // --- ESTILOS ---
  const actionButton =
    "flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-20 disabled:grayscale";

  return (
    <div className="bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden mt-6 animate-in fade-in duration-700">
      {/* Decoración Superior */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none"></div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Estado del{" "}
            <span className="text-blue-500 text-outline">Legado</span>
          </h2>
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.4em] mt-1">
            Sincronización de Contrato Inteligente
          </p>
        </div>

        {/* Selector de Cuenta Estilizado */}
        <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex items-center gap-4 group">
          <div className="text-right">
            <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest block">
              Operador Actual
            </span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-transparent text-[11px] font-mono font-bold text-gray-400 outline-none cursor-pointer"
              disabled={accounts.length === 0}
            >
              {accounts.map((acc) => (
                <option key={acc} value={acc} className="bg-[#0d0f14]">
                  {acc.substring(0, 18)}...
                </option>
              ))}
            </select>
          </div>
          <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest mb-6 flex items-center gap-3">
          <span className="animate-pulse">●</span> {error}
        </div>
      )}

      {/* DASHBOARD DE DATOS */}
      {datosContrato && web3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-black/40 p-5 rounded-[1.8rem] border border-white/5">
            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-2">
              C.I. Testador
            </span>
            <span className="text-sm font-mono font-bold text-white tracking-tighter">
              {datosContrato[0]}
            </span>
          </div>
          <div className="bg-black/40 p-5 rounded-[1.8rem] border border-white/5 overflow-hidden">
            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-2">
              Wallet Destino
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-400 truncate block">
              {datosContrato[1]}
            </span>
          </div>
          <div className="bg-black/40 p-5 rounded-[1.8rem] border border-white/5">
            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-2">
              Estado Protocolo
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                datosContrato[2] ? "text-green-500" : "text-amber-500"
              }`}
            >
              {datosContrato[2] ? "● Ejecución Activada" : "○ En Espera"}
            </span>
          </div>
          <div className="bg-blue-600/10 p-5 rounded-[1.8rem] border border-blue-500/20">
            <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest block mb-2">
              Fondo Acumulado
            </span>
            <span className="text-xl font-black text-white italic tracking-tighter">
              {web3.utils.fromWei(datosContrato[3], "ether")}{" "}
              <span className="text-[10px] text-blue-500">ETH</span>
            </span>
          </div>
        </div>
      )}

      {/* PANEL DE ACCIONES INDUSTRIAL */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={activarPrueba}
          disabled={!contract || !selectedAccount || loadingAction}
          className={`${actionButton} bg-amber-600/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white shadow-lg shadow-amber-900/5`}
        >
          {loadingAction ? "Procesando..." : "Activar Protocolo Deceso"}
        </button>

        <button
          onClick={reclamarHerencia}
          disabled={!contract || !selectedAccount || loadingAction}
          className={`${actionButton} bg-green-600/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white shadow-lg shadow-green-900/5`}
        >
          {loadingAction ? "Procesando..." : "Reclamar Activos"}
        </button>

        <button
          onClick={retirarFondos}
          disabled={!contract || !selectedAccount || loadingAction}
          className={`${actionButton} bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-lg shadow-red-900/5`}
        >
          {loadingAction ? "Procesando..." : "Retirar Fondos"}
        </button>
      </div>

      {/* Pie de página Tech */}
      <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center opacity-30">
        <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em]">
          Protocolo Legacy v2.0
        </p>
        <div className="flex gap-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
