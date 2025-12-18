import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PersonasABI from "../ABI/Persona.json";
import { PERSONAS_ADDRESS } from "../config";

export default function DAppPersona() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);

  // Inputs
  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [consultaCI, setConsultaCI] = useState("");
  const [persona, setPersona] = useState(null);

  // Lógica de carga intacta
  const loadWeb3Data = async (web3Instance, accs) => {
    if (!accs || accs.length === 0) {
      setError("MetaMask no conectada o cuenta no seleccionada.");
      setAccounts([]);
      setSelectedAccount("");
      return;
    }

    const instance = new web3Instance.eth.Contract(
      PersonasABI.abi,
      PERSONAS_ADDRESS
    );

    setWeb3(web3Instance);
    setAccounts(accs);
    setSelectedAccount(accs[0]);
    setContract(instance);
    setError(null);
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          const accs = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          loadWeb3Data(web3Instance, accs);

          const handleAccountsChanged = (newAccounts) => {
            loadWeb3Data(web3Instance, newAccounts);
          };

          const handleChainChanged = () => {
            window.location.reload();
          };

          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);

          return () => {
            if (window.ethereum && window.ethereum.removeListener) {
              window.ethereum.removeListener(
                "accountsChanged",
                handleAccountsChanged
              );
              window.ethereum.removeListener(
                "chainChanged",
                handleChainChanged
              );
            }
          };
        } catch (e) {
          setError("Error al conectar con MetaMask. Revise permisos.");
        }
      } else {
        setError("MetaMask no detectado. Instale el plugin.");
      }
    };
    init();
  }, []);

  const registrarPersona = async () => {
    if (!contract || !selectedAccount)
      return alert("Conecte MetaMask primero.");
    if (!cedula || !nombres || !apellidos)
      return alert("Completa todos los campos");
    try {
      await contract.methods
        .registrarPersonaEsencial(cedula, nombres, apellidos)
        .send({ from: selectedAccount });
      alert("Persona registrada!");
      setCedula("");
      setNombres("");
      setApellidos("");
    } catch (err) {
      alert("Error al registrar persona.");
    }
  };

  const consultarPersona = async () => {
    if (!contract) return alert("Conecte MetaMask primero.");
    try {
      const datos = await contract.methods
        .obtenerPersonaPorCI(consultaCI)
        .call();
      if (datos && datos[1]) {
        setPersona({
          cedula: datos[0],
          nombres: datos[1],
          apellidos: datos[2],
          wallet: datos[3],
        });
      } else {
        alert("No encontrada");
        setPersona(null);
      }
    } catch (err) {
      alert("Error al consultar persona.");
      setPersona(null);
    }
  };

  // ESTILOS DE COMPONENTES REUTILIZABLES
  const cardStyle =
    "bg-[#0d0f14] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden";
  const inputStyle =
    "w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none text-white font-bold text-sm focus:border-blue-500/50 transition-all placeholder:text-gray-700";
  const labelStyle =
    "text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-2";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* HEADER DE LA SECCIÓN */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Registro <span className="text-blue-500 text-outline">Civil</span>
          </h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.5em] mt-2">
            Identidad On-Chain Protocol
          </p>
        </div>

        {/* Selector de cuenta estilizado como Terminal */}
        <div className="bg-black/40 border border-white/5 p-2 rounded-2xl flex items-center gap-4">
          <div className="pl-4">
            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block">
              Nodo Activo
            </span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-transparent text-xs font-mono text-gray-400 outline-none cursor-pointer"
              disabled={accounts.length === 0}
            >
              {accounts.map((acc) => (
                <option key={acc} value={acc} className="bg-[#0d0f14]">
                  {acc.substring(0, 12)}...
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-bounce">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BLOQUE REGISTRO */}
        <section className={cardStyle}>
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/40"></div>
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8">
            Ingresar Nuevo Ciudadano
          </h3>

          <div className="space-y-6">
            <div>
              <label className={labelStyle}>Documento de Identidad</label>
              <input
                type="text"
                placeholder="Número de Cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Nombres</label>
                <input
                  type="text"
                  placeholder="Ej: Juan"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Apellidos</label>
                <input
                  type="text"
                  placeholder="Ej: Pérez"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>

            <button
              onClick={registrarPersona}
              disabled={!contract || !selectedAccount}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-20 shadow-xl"
            >
              Ejecutar Registro
            </button>
          </div>
        </section>

        {/* BLOQUE CONSULTA */}
        <div className="space-y-8">
          <section className={cardStyle}>
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500/40"></div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-8">
              Consultar Registro Civil
            </h3>

            <div className="flex gap-3 bg-black/40 p-2 rounded-2xl border border-white/5 focus-within:border-green-500/30 transition-all">
              <input
                type="text"
                placeholder="Introducir CI..."
                value={consultaCI}
                onChange={(e) => setConsultaCI(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-4 text-white font-bold placeholder:text-gray-700"
              />
              <button
                onClick={consultarPersona}
                disabled={!contract || !selectedAccount}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-20"
              >
                Buscar
              </button>
            </div>
          </section>

          {/* RESULTADO DE BÚSQUEDA */}
          {persona && (
            <div className="bg-gradient-to-br from-blue-600/20 to-transparent p-[1px] rounded-[2.5rem] animate-in zoom-in-95 duration-500">
              <div className="bg-[#0d0f14] p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-2">
                      Expediente Encontrado
                    </span>
                    <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">
                      {persona.nombres} <br /> {persona.apellidos}
                    </h4>
                  </div>
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl grayscale">
                    👤
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">
                      Cédula
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-300">
                      {persona.cedula}
                    </span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">
                      Status Red
                    </span>
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
                      Verificado
                    </span>
                  </div>
                  <div className="col-span-2 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest block mb-1">
                      Dirección Ledger (Wallet)
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 break-all">
                      {persona.wallet}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
