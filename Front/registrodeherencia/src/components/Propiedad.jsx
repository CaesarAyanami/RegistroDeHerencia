import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PropiedadesABI from "../ABI/Propiedades.json"; // ABI generado por Truffle

// Helper para mostrar direcciones de forma concisa
const truncateAddress = (address) => {
  if (!address) return "N/A";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

const PropiedadesComponent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de carga

  // Estados para registrar propiedad
  const [ci, setCi] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Estados para listar propiedades
  const [propiedades, setPropiedades] = useState([]);

  // Estados para consultar/transferir propiedad
  const [propiedadId, setPropiedadId] = useState("");
  const [propiedadDetalle, setPropiedadDetalle] = useState(null);

  // Estados para transferir propiedad
  const [ciNuevo, setCiNuevo] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = PropiedadesABI.networks[networkId];

          if (!deployedNetwork) {
            alert("Contrato Propiedades no desplegado en esta red.");
            return;
          }

          const instance = new web3.eth.Contract(
            PropiedadesABI.abi,
            deployedNetwork.address
          );
          setContract(instance);
        } catch (error) {
          console.error("Error al inicializar:", error);
          alert(
            "Error al conectar con MetaMask o cargar el contrato Propiedades."
          );
        }
      } else {
        alert("MetaMask no detectado.");
      }
    };
    init();
  }, []);

  // Helper para obtener gasPrice (para transacciones)
  const withGasPrice = async (web3Instance) => {
    if (!web3Instance) return null;
    return await web3Instance.eth.getGasPrice();
  };

  // Registrar propiedad
  const registrarPropiedad = async () => {
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await withGasPrice(web3);
      await contract.methods
        .registrarPropiedad(ci, descripcion)
        .send({ from: account, gasPrice });
      alert("Propiedad registrada ✅");
      setCi("");
      setDescripcion("");
    } catch (err) {
      console.error(err);
      alert("Error al registrar propiedad ❌. (Verifique CI y Wallet)");
    } finally {
      setLoading(false);
    }
  };

  // Listar propiedades por CI
  const listarPropiedades = async () => {
    if (!ci) {
      alert("Ingrese la CI para listar propiedades.");
      return;
    }
    setLoading(true);
    try {
      const result = await contract.methods.listarPropiedadesPorCI(ci).call();
      setPropiedades(result);
    } catch (err) {
      console.error(err);
      alert("Error al listar propiedades ❌. (Verifique que la CI exista)");
    } finally {
      setLoading(false);
    }
  };

  // Consultar propiedad por ID
  const consultarPropiedad = async () => {
    if (!propiedadId) return;
    try {
      const id = parseInt(propiedadId, 10);
      if (Number.isNaN(id) || id <= 0) {
        alert("ID de propiedad inválido.");
        return;
      }
      const result = await contract.methods
        .obtenerPropiedad(propiedadId)
        .call();
      setPropiedadDetalle(result);
    } catch (err) {
      console.error(err);
      setPropiedadDetalle(null);
      alert(
        `Error al consultar propiedad ID ${propiedadId} ❌. (Propiedad no existe)`
      );
    }
  };

  // Transferir propiedad
  const transferirPropiedad = async () => {
    if (!propiedadId || !ciNuevo) {
      alert("Ingrese el ID de la propiedad y la CI del nuevo dueño.");
      return;
    }
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await withGasPrice(web3);
      await contract.methods
        .transferirPropiedad(propiedadId, ciNuevo)
        .send({ from: account, gasPrice });
      alert("Propiedad transferida ✅");
      setPropiedadId("");
      setCiNuevo("");
    } catch (err) {
      console.error(err);
      alert(
        "Error al transferir propiedad ❌. (Asegúrese de ser el dueño actual)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header y Conectividad */}
        <div className="text-center space-y-3 p-4 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            🏛️ Registro de Propiedades (Contrato Básico)
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
            <span
              className={`w-2 h-2 ${
                account ? "bg-green-500" : "bg-red-500"
              } rounded-full mr-2`}
            ></span>
            Wallet Conectada: {truncateAddress(account)}
          </div>
        </div>

        {/* Grid de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Registrar Propiedad */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-blue-600 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              ➕ Registrar Propiedad
            </h3>
            <p className="text-sm text-gray-600">
              (La wallet conectada debe coincidir con la registrada para la CI)
            </p>
            <input
              type="text"
              placeholder="CI del dueño"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <input
              type="text"
              placeholder="Descripción (ej: Casa en Av. Principal 123)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <button
              onClick={registrarPropiedad}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              disabled={loading || !contract || !ci || !descripcion}
            >
              {loading ? "Registrando..." : "Registrar Propiedad"}
            </button>
          </div>

          {/* 2. Transferir Propiedad */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-red-600 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              ➡️ Transferir Propiedad
            </h3>
            <p className="text-sm text-gray-600">
              (Solo el dueño actual, `msg.sender`, puede iniciar la
              transferencia)
            </p>
            <input
              type="number"
              placeholder="ID Propiedad a transferir"
              value={propiedadId}
              onChange={(e) => setPropiedadId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150"
            />
            <input
              type="text"
              placeholder="CI del Nuevo Dueño"
              value={ciNuevo}
              onChange={(e) => setCiNuevo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition duration-150"
            />
            <button
              onClick={transferirPropiedad}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              disabled={loading || !contract || !propiedadId || !ciNuevo}
            >
              {loading ? "Transfiriendo..." : "Transferir Propiedad"}
            </button>
          </div>
        </div>

        {/* Grid de Consultas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 3. Listar Propiedades por CI */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-green-600 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              📋 Listar Propiedades por CI
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CI de la persona"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={listarPropiedades}
                className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition duration-150"
                disabled={loading || !contract || !ci}
              >
                {loading ? "Listando..." : "Listar"}
              </button>
            </div>
            {propiedades.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-300 max-h-48 overflow-y-auto">
                <p className="font-semibold text-green-800 mb-2 border-b border-green-300 pb-1">
                  Resultados ({propiedades.length}):
                </p>
                <ul className="space-y-2">
                  {propiedades.map((p, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-800 bg-white p-2 rounded shadow-sm"
                    >
                      <p>
                        **ID {p.idPropiedad}** | {p.descripcion}
                      </p>
                      <p className="text-xs text-gray-500">
                        CI: {p.ciDueno} | Wallet:{" "}
                        {truncateAddress(p.walletDueno)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {propiedades.length === 0 && loading === false && (
              <p className="text-sm text-gray-500 text-center pt-2">
                No hay resultados para la CI ingresada.
              </p>
            )}
          </div>

          {/* 4. Consultar Propiedad por ID */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-purple-600 space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              🔎 Consultar Propiedad por ID
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="ID Propiedad"
                value={propiedadId}
                onChange={(e) => setPropiedadId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={consultarPropiedad}
                className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50 transition duration-150"
                disabled={!propiedadId}
              >
                Consultar
              </button>
            </div>

            {propiedadDetalle && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-300 text-sm space-y-1">
                <p className="font-bold text-purple-800 mb-2 border-b border-purple-300 pb-1">
                  Detalles de Propiedad ID: {propiedadDetalle.idPropiedad}
                </p>
                <p>
                  <strong>Descripción:</strong> {propiedadDetalle.descripcion}
                </p>
                <p>
                  <strong>CI Dueño:</strong> {propiedadDetalle.ciDueno}
                </p>
                <p>
                  <strong>Wallet Dueño:</strong>{" "}
                  {truncateAddress(propiedadDetalle.walletDueno)}
                </p>
                <p>
                  <strong>En Herencia:</strong>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      propiedadDetalle.enHerencia
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {propiedadDetalle.enHerencia ? "SÍ" : "NO"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropiedadesComponent;
