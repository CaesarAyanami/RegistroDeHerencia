import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HerenciaABI from "../ABI/HerenciaConRegistro.json";
import { HERENCIA_ADDRESS } from "../config";

export default function DAppPersonaHerencia() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [datosContrato, setDatosContrato] = useState(null);
  const [error, setError] = useState(null); // Para manejar errores de conexión/datos

  // Función centralizada para cargar datos y contratos
  const loadWeb3Data = async (web3Instance, accs) => {
    if (!accs || accs.length === 0) {
      setError("MetaMask no conectada o cuenta no seleccionada.");
      setAccounts([]);
      setSelectedAccount("");
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
      // Aseguramos que la lectura sea correcta
      const datos = await instance.methods.obtenerDatosContrato().call();
      setDatosContrato(datos);
    } catch (e) {
      console.error("Error al cargar datos del contrato de Herencia:", e);
      setError(
        "Error al leer datos del contrato. Verifique la red y la migración."
      );
      setDatosContrato(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);

        try {
          // Solicitar cuentas (esto activa MetaMask si no está conectado)
          const accs = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          loadWeb3Data(web3Instance, accs);

          // --- LISTENER (ESCUCHA) PARA CAMBIOS DE CUENTA ---
          const handleAccountsChanged = (newAccounts) => {
            console.log("Cuentas cambiadas:", newAccounts);
            loadWeb3Data(web3Instance, newAccounts);
          };

          // --- LISTENER PARA CAMBIOS DE RED ---
          const handleChainChanged = () => {
            window.location.reload(); // Recarga la página si cambia de red (p. ej., de Ganache a Mainnet)
          };

          window.ethereum.on("accountsChanged", handleAccountsChanged);
          window.ethereum.on("chainChanged", handleChainChanged);

          // Función de limpieza al desmontar el componente
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
          console.error("Error de conexión inicial con MetaMask:", e);
          setError("Error al conectar con MetaMask. Revise permisos.");
        }
      } else {
        setError("MetaMask no detectado. Instale el plugin.");
      }
    };
    init();
  }, []);

  // Funciones de contrato (activarPrueba, reclamarHerencia, retirarFondos)
  // ... (Mantener el código de tus funciones 'activarPrueba', 'reclamarHerencia' y 'retirarFondos' ya que estaban correctas)

  const activarPrueba = async () => {
    // ... (código existente)
  };

  const reclamarHerencia = async () => {
    // ... (código existente)
  };

  const retirarFondos = async () => {
    // ... (código existente)
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Contrato de Herencia</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Selector de cuenta */}
      <div className="mb-4">
        <label className="font-semibold">Cuenta activa:</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="border p-2 ml-2"
          disabled={accounts.length === 0}
        >
          {accounts.map((acc) => (
            <option key={acc} value={acc}>
              {acc}
            </option>
          ))}
        </select>
      </div>

      {datosContrato && web3 && (
        <div className="p-4 border rounded bg-gray-50 mb-4">
          <p>
            <strong>CI Testador:</strong> {datosContrato[0]}
          </p>
          <p>
            <strong>Wallet Testador:</strong> {datosContrato[1]}
          </p>
          <p>
            <strong>Prueba Fallecimiento:</strong>{" "}
            {datosContrato[2] ? "Activada" : "No activada"}
          </p>
          <p>
            <strong>Balance Contrato:</strong>{" "}
            {web3.utils.fromWei(datosContrato[3], "ether")} ETH
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={activarPrueba}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!contract || !selectedAccount}
        >
          Activar Prueba Fallecimiento
        </button>

        <button
          onClick={reclamarHerencia}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!contract || !selectedAccount}
        >
          Reclamar Herencia
        </button>

        <button
          onClick={retirarFondos}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!contract || !selectedAccount}
        >
          Retirar Fondos
        </button>
      </div>
    </div>
  );
}
