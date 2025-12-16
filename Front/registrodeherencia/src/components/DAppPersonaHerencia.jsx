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

  // Función auxiliar para truncar direcciones visualmente
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Cargar contrato y datos
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
      setError("Error al leer datos. Verifique red y dirección.");
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
        console.error("Error de conexión inicial con MetaMask:", e);
        setError("Error al conectar con MetaMask. Revise permisos.");
      }
    };

    init();
  }, []);

  // Helpers
  const refreshDatos = async () => {
    if (!contract) return;
    try {
      const datos = await contract.methods.obtenerDatosContrato().call();
      setDatosContrato(datos);
    } catch (e) {
      console.error("Error al refrescar datos:", e);
    }
  };

  const withGasPrice = async () => {
    if (!web3) throw new Error("Web3 no inicializado");
    return await web3.eth.getGasPrice();
  };

  // Acciones del contrato
  const activarPrueba = async () => {
    if (!contract || !selectedAccount) return;
    setLoadingAction(true);
    try {
      const gasPrice = await withGasPrice();
      await contract.methods.activarPruebaFallecimiento().send({
        from: selectedAccount,
        gasPrice,
      });
      alert("✅ Prueba de fallecimiento activada");
      await refreshDatos();
    } catch (err) {
      console.error(err);
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
      await contract.methods.reclamarHerencia().send({
        from: selectedAccount,
        gasPrice,
      });
      alert("✅ Herencia reclamada");
      await refreshDatos();
    } catch (err) {
      console.error(err);
      alert("❌ Error al reclamar herencia");
    } finally {
      setLoadingAction(false);
    }
  };

  const retirarFondos = async () => {
    if (!contract || !selectedAccount) return;
    setLoadingAction(true);
    try {
      const gasPrice = await withGasPrice();
      await contract.methods.retirarFondos().send({
        from: selectedAccount,
        gasPrice,
      });
      alert("✅ Fondos retirados");
      await refreshDatos();
    } catch (err) {
      console.error(err);
      alert("❌ Error al retirar fondos");
    } finally {
      setLoadingAction(false);
    }
  };

  // Estilos (Clases de Tailwind)
  const cardClass = "bg-white p-6 rounded-xl shadow-lg border border-gray-100";
  const labelClass =
    "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1";
  const valueClass = "text-lg font-semibold text-gray-800 break-words";

  // Botones con estados
  const btnBase =
    "w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            📜 Contrato de Herencia
          </h2>
          <div className="mt-4 md:mt-0">
            {/* Selector de cuenta estilizado */}
            <div className="relative">
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                disabled={accounts.length === 0}
                className="appearance-none bg-white border border-blue-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm w-full md:w-64 cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {truncateAddress(acc)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm"
            role="alert"
          >
            <p className="font-bold">Error de Conexión</p>
            <p>{error}</p>
          </div>
        )}

        {/* Dashboard de Datos del Contrato */}
        {datosContrato && web3 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Testator */}
            <div className={`${cardClass} border-t-4 border-t-indigo-500`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👤</span>
                <h3 className="text-gray-800 font-bold">Datos Testador</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <span className={labelClass}>Cédula (CI)</span>
                  <p className={valueClass}>{datosContrato[0]}</p>
                </div>
                <div>
                  <span className={labelClass}>Wallet</span>
                  <p className="text-sm text-gray-600 font-mono bg-gray-100 p-1 rounded break-all">
                    {datosContrato[1]}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Estado y Balance */}
            <div className={`${cardClass} border-t-4 border-t-green-500`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💰</span>
                <h3 className="text-gray-800 font-bold">Estado Financiero</h3>
              </div>
              <div>
                <span className={labelClass}>Balance del Contrato</span>
                <p className="text-3xl font-bold text-green-600">
                  {web3.utils.fromWei(datosContrato[3], "ether")}{" "}
                  <span className="text-sm text-gray-500">ETH</span>
                </p>
              </div>
            </div>

            {/* Card 3: Prueba de Vida */}
            <div className={`${cardClass} border-t-4 border-t-pink-500`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🕯️</span>
                <h3 className="text-gray-800 font-bold">Estado Vital</h3>
              </div>
              <div>
                <span className={labelClass}>Prueba de Fallecimiento</span>
                <div
                  className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    datosContrato[2]
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      datosContrato[2] ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></span>
                  {datosContrato[2]
                    ? "ACTIVADA (Fallecido)"
                    : "NO ACTIVADA (Vivo)"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl shadow border border-dashed border-gray-300">
            <p className="text-gray-500">
              Cargando datos del contrato o esperando conexión...
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button
            onClick={activarPrueba}
            className={`${btnBase} bg-indigo-600 hover:bg-indigo-700`}
            disabled={!contract || !selectedAccount || loadingAction}
          >
            {loadingAction ? "⏳" : "⚰️"} Activar Prueba
          </button>

          <button
            onClick={reclamarHerencia}
            className={`${btnBase} bg-emerald-600 hover:bg-emerald-700`}
            disabled={!contract || !selectedAccount || loadingAction}
          >
            {loadingAction ? "⏳" : "🤝"} Reclamar Herencia
          </button>

          <button
            onClick={retirarFondos}
            className={`${btnBase} bg-rose-600 hover:bg-rose-700`}
            disabled={!contract || !selectedAccount || loadingAction}
          >
            {loadingAction ? "⏳" : "💸"} Retirar Fondos
          </button>
        </div>

        {/* Nota Informativa */}
        <div className="text-center text-xs text-gray-400 mt-4">
          Interactuando con contrato en:{" "}
          <span className="font-mono">{HERENCIA_ADDRESS}</span>
        </div>
      </div>
    </div>
  );
}
