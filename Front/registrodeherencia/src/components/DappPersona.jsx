import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PersonasABI from "../ABI/Personas.json";
import { PERSONAS_ADDRESS } from "../config";

export default function DAppPersona() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null); // Nuevo estado de error

  // Inputs
  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [consultaCI, setConsultaCI] = useState("");
  const [persona, setPersona] = useState(null);

  // Función centralizada para cargar datos y contratos
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
          // Solicitar cuentas
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
            window.location.reload();
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

  // Funciones de contrato
  const registrarPersona = async () => {
    if (!contract || !selectedAccount) {
      alert("Conecte MetaMask primero.");
      return;
    }
    if (!cedula || !nombres || !apellidos) {
      alert("Completa todos los campos");
      return;
    }
    try {
      await contract.methods
        .registrarPersonaEsencial(cedula, nombres, apellidos)
        .send({ from: selectedAccount });
      alert("Persona registrada!");
      // Limpiar campos
      setCedula("");
      setNombres("");
      setApellidos("");
    } catch (err) {
      console.error(err);
      alert("Error al registrar persona. Revise la consola.");
    }
  };

  const consultarPersona = async () => {
    if (!contract) {
      alert("Conecte MetaMask primero.");
      return;
    }
    try {
      const datos = await contract.methods
        .obtenerPersonaPorCI(consultaCI)
        .call();

      // Asumiendo que el contrato devuelve [ci, nombres, apellidos, wallet]
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
      console.error(err);
      alert("Error al consultar persona. Revise la CI.");
      setPersona(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Registro Civil DApp</h2>

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

      {/* Registro */}
      <div className="mb-6">
        <h3 className="font-semibold">Registrar Persona</h3>
        {/* ... (Tus inputs de registro) */}
        <input
          type="text"
          placeholder="Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Nombres"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Apellidos"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={registrarPersona}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!contract || !selectedAccount}
        >
          Registrar
        </button>
      </div>

      {/* Consulta */}
      <div className="mb-6">
        <h3 className="font-semibold">Consultar Persona por CI</h3>
        <input
          type="text"
          placeholder="Cédula"
          value={consultaCI}
          onChange={(e) => setConsultaCI(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={consultarPersona}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          disabled={!contract || !selectedAccount}
        >
          Consultar
        </button>
      </div>

      {/* Resultado */}
      {persona && persona.nombres && (
        <div className="p-4 border rounded bg-gray-50">
          <p>
            <strong>Nombres:</strong> {persona.nombres}
          </p>
          <p>
            <strong>Apellidos:</strong> {persona.apellidos}
          </p>
          <p>
            <strong>Cédula:</strong> {persona.cedula}
          </p>
          <p>
            <strong>Wallet:</strong> {persona.wallet}
          </p>
        </div>
      )}
    </div>
  );
}
