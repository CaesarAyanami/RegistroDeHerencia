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
      alert("❌ Error al activar prueba (verifique permisos y estado)");
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
      alert("❌ Error al reclamar herencia (verifique requisitos y rol)");
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
      alert("❌ Error al retirar fondos (verifique saldo y permisos)");
    } finally {
      setLoadingAction(false);
    }
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
          disabled={!contract || !selectedAccount || loadingAction}
        >
          {loadingAction ? "Procesando..." : "Activar Prueba Fallecimiento"}
        </button>

        <button
          onClick={reclamarHerencia}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!contract || !selectedAccount || loadingAction}
        >
          {loadingAction ? "Procesando..." : "Reclamar Herencia"}
        </button>

        <button
          onClick={retirarFondos}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!contract || !selectedAccount || loadingAction}
        >
          {loadingAction ? "Procesando..." : "Retirar Fondos"}
        </button>
      </div>
    </div>
  );
}
