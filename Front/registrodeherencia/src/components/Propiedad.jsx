import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PropiedadesABI from "../ABI/Propiedades.json"; // ABI generado por Truffle

const PropiedadesComponent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para registrar y listar propiedad
  const [ci, setCi] = useState(""); // CI usado para Registro y Listado
  const [descripcion, setDescripcion] = useState("");

  // Estados para listar propiedades (resultado)
  const [propiedades, setPropiedades] = useState([]);

  // Estados para consultar y transferir propiedad
  const [propiedadId, setPropiedadId] = useState("");
  const [propiedadDetalle, setPropiedadDetalle] = useState(null);
  const [ciNuevo, setCiNuevo] = useState("");

  // --- Estilos Reutilizables (Tailwind CSS) ---
  const cardClass =
    "bg-white p-6 rounded-xl shadow-lg border border-gray-100 space-y-4";
  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
  const btnBase =
    "w-full py-2 px-4 rounded-lg font-bold text-white shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  // Función auxiliar para truncar direcciones
  const truncateAddress = (address) => {
    if (!address) return "N/A";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Función auxiliar para obtener gasPrice
  const withGasPrice = async (web3Instance) => {
    if (!web3Instance) return null;
    return await web3Instance.eth.getGasPrice();
  };

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
      alert("Error al registrar propiedad ❌");
    } finally {
      setLoading(false);
    }
  };

  // Listar propiedades por CI
  const listarPropiedades = async () => {
    try {
      const result = await contract.methods.listarPropiedadesPorCI(ci).call();
      setPropiedades(result);
    } catch (err) {
      console.error(err);
      setPropiedades([]);
    }
  };

  // Consultar propiedad por ID
  const consultarPropiedad = async () => {
    try {
      const result = await contract.methods
        .obtenerPropiedad(propiedadId)
        .call();
      setPropiedadDetalle(result);
    } catch (err) {
      console.error(err);
      setPropiedadDetalle(null);
      alert(`Error al consultar ID ${propiedadId}. ¿Existe?`);
    }
  };

  // Transferir propiedad
  const transferirPropiedad = async () => {
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await withGasPrice(web3);
      await contract.methods
        .transferirPropiedad(propiedadId, ciNuevo)
        .send({ from: account, gasPrice });
      alert("Propiedad transferida ✅");
      setCiNuevo("");
      setPropiedadId("");
    } catch (err) {
      console.error(err);
      alert("Error al transferir propiedad ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            🏛️ Registro de Propiedades Digitales
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Cuenta conectada: {truncateAddress(account)}
          </div>
        </div>

        {/* Módulos de Operación (Registro, Transferencia, Consulta) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Registrar Propiedad */}
          <div
            className={`${cardClass} lg:col-span-1 border-t-4 border-t-blue-600`}
          >
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📝 Registro de Nuevo Bien
            </h3>
            <input
              type="text"
              placeholder="CI del dueño"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Descripción del bien (Dirección, metraje, etc.)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={inputClass}
            />
            <button
              onClick={registrarPropiedad}
              className={`${btnBase} bg-blue-600 hover:bg-blue-700`}
              disabled={loading || !ci || !descripcion}
            >
              {loading ? "Registrando..." : "Registrar Propiedad"}
            </button>
          </div>

          {/* 2. Transferir Propiedad */}
          <div
            className={`${cardClass} lg:col-span-1 border-t-4 border-t-red-600`}
          >
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🔄 Transferir Título (Venta/Donación)
            </h3>
            <input
              type="text"
              placeholder="ID Propiedad a transferir"
              value={propiedadId}
              onChange={(e) => setPropiedadId(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="CI Nuevo Dueño"
              value={ciNuevo}
              onChange={(e) => setCiNuevo(e.target.value)}
              className={inputClass}
            />
            <button
              onClick={transferirPropiedad}
              className={`${btnBase} bg-red-600 hover:bg-red-700`}
              disabled={loading || !propiedadId || !ciNuevo}
            >
              {loading ? "Transfiriendo..." : "Ejecutar Transferencia"}
            </button>
          </div>

          {/* 3. Consultar Propiedad (por ID) */}
          <div
            className={`${cardClass} lg:col-span-1 border-t-4 border-t-purple-600`}
          >
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🔍 Consultar Detalle (por ID)
            </h3>
            <input
              type="text"
              placeholder="ID Propiedad"
              value={propiedadId}
              onChange={(e) => setPropiedadId(e.target.value)}
              className={inputClass}
            />
            <button
              onClick={consultarPropiedad}
              className={`${btnBase} bg-purple-600 hover:bg-purple-700`}
              disabled={!propiedadId}
            >
              Consultar
            </button>

            {propiedadDetalle && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-1">
                <p>
                  <strong className="text-purple-700">ID:</strong>{" "}
                  {propiedadDetalle.idPropiedad}
                </p>
                <p>
                  <strong className="text-purple-700">CI Dueño:</strong>{" "}
                  {propiedadDetalle.ciDueno}
                </p>
                <p>
                  <strong className="text-purple-700">Descripción:</strong>{" "}
                  {propiedadDetalle.descripcion}
                </p>
                <p className="truncate">
                  <strong className="text-purple-700">Wallet Dueño:</strong>{" "}
                  {propiedadDetalle.walletDueno}
                </p>
                <p>
                  <strong className="text-purple-700">Estado:</strong>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      propiedadDetalle.enHerencia
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {propiedadDetalle.enHerencia
                      ? "Bajo Proceso de Herencia"
                      : "Activo"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Módulo de Listado por CI (Resultado) */}
        <div className={`${cardClass} border-t-4 border-t-green-600`}>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            📜 Listado de Bienes por Identificación
          </h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="CI del dueño para listar sus propiedades"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              className={`${inputClass} max-w-sm`}
            />
            <button
              onClick={listarPropiedades}
              className={`w-40 py-2 px-4 rounded-lg font-bold text-white shadow bg-green-600 hover:bg-green-700 disabled:opacity-50`}
              disabled={!ci}
            >
              Listar Bienes
            </button>
          </div>

          <ul className="mt-4 space-y-3 max-h-60 overflow-y-auto">
            {propiedades.length > 0 ? (
              propiedades.map((p, idx) => (
                <li
                  key={idx}
                  className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm flex justify-between items-center hover:shadow-md transition"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      Propiedad ID: {p.idPropiedad}
                    </span>
                    <span className="text-gray-600 truncate">
                      {p.descripcion}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-gray-400">
                      CI Dueño: {p.ciDueno}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.enHerencia
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {p.enHerencia ? "Herencia Pendiente" : "Título Limpio"}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-center py-5 bg-white rounded-lg border border-dashed border-gray-300">
                Ingrese un CI y presione "Listar Bienes" para ver sus
                propiedades registradas.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PropiedadesComponent;
