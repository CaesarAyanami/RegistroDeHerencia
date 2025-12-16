import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HerenciaABI from "../ABI/RegistroPropiedadesHerencia.json";

const HerenciaComponent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  // Estados de Registro
  const [ciDueno, setCiDueno] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Estados de Herencia
  const [idPropiedad, setIdPropiedad] = useState("");
  const [herederos, setHerederos] = useState([]);
  const [porcentajes, setPorcentajes] = useState([]);
  const [ciHeredero, setCiHeredero] = useState("");
  const [porcentaje, setPorcentaje] = useState("");

  // Estados de Consulta
  const [propiedad, setPropiedad] = useState(null);
  const [herenciaDefinida, setHerenciaDefinida] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = HerenciaABI.networks[networkId];

          if (!deployedNetwork) {
            alert("Contrato no desplegado en esta red");
            return;
          }

          const instance = new web3.eth.Contract(
            HerenciaABI.abi,
            deployedNetwork.address
          );
          setContract(instance);
        } catch (error) {
          console.error("Error init:", error);
        }
      } else {
        showNotification("MetaMask no detectado.", 'error');
      }
    };
    init();
  }, []);

  // Función auxiliar para truncar direcciones
  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const registrarPropiedad = async () => {
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await web3.eth.getGasPrice();
      await contract.methods
        .registrarPropiedad(ciDueno, descripcion)
        .send({ from: account, gasPrice });
      alert("Propiedad registrada ✅");
      setCiDueno("");
      setDescripcion("");
    } catch (err) {
      console.error(err);
      alert("Error al registrar propiedad ❌");
    } finally {
      setLoading(false);
    }
  };

  const agregarHeredero = () => {
    if (!ciHeredero || !porcentaje) return;
    setHerederos([...herederos, ciHeredero]);
    setPorcentajes([...porcentajes, parseInt(porcentaje)]);
    setCiHeredero("");
    setPorcentaje("");
  };

  const definirHerencia = async () => {
    const total = porcentajes.reduce((a, b) => a + b, 0);
    if (total !== 100) {
      alert(`Los porcentajes suman ${total}%. Deben sumar exactamente 100%.`);
      return;
    }
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await web3.eth.getGasPrice();
      await contract.methods
        .definirHerencia(idPropiedad, herederos, porcentajes)
        .send({ from: account, gasPrice });
      alert("Herencia definida ✅");
      setHerederos([]);
      setPorcentajes([]);
    } catch (err) {
      console.error(err);
      alert("Error al definir herencia ❌");
    } finally {
      setLoading(false);
    }
  };

  const ejecutarHerencia = async () => {
    if (!idPropiedad) return alert("Ingresa un ID de propiedad");
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await web3.eth.getGasPrice();
      await contract.methods
        .ejecutarHerencia(idPropiedad)
        .send({ from: account, gasPrice });
      alert("Herencia ejecutada correctamente ✅");
    } catch (err) {
      console.error(err);
      alert("Error al ejecutar herencia ❌");
    } finally {
      setLoading(false);
    }
  };

  const consultarPropiedad = async () => {
    if (!idPropiedad) return;
    try {
      const result = await contract.methods
        .obtenerPropiedad(idPropiedad)
        .call();
      setPropiedad(result);
    } catch (err) {
      console.error(err);
      alert("Propiedad no encontrada ❌");
      setPropiedad(null);
    }
  };

  const consultarHerencia = async () => {
    if (!idPropiedad) return;
    try {
      const result = await contract.methods.obtenerHerencia(idPropiedad).call();
      setHerenciaDefinida(result);
    } catch (err) {
      console.error(err);
      alert("Error al consultar herencia ❌");
      setHerenciaDefinida([]);
    }
  };

  // Clases comunes
  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all";
  const btnPrimary =
    "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSecondary =
    "w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200";
  const cardClass = "bg-white p-6 rounded-xl shadow-lg border border-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Gestión de Propiedades y Herencias
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Conectado: {account ? truncateAddress(account) : "No conectado"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. Registrar Propiedad */}
          <div className={cardClass}>
            <div className="flex items-center mb-4 space-x-2 border-b pb-2">
              <span className="text-2xl">🏠</span>
              <h2 className="text-xl font-bold text-gray-800">
                Registrar Propiedad
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula del Dueño
                </label>
                <input
                  value={ciDueno}
                  onChange={(e) => setCiDueno(e.target.value)}
                  placeholder="Ej: 12345678"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Bien
                </label>
                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Apartamento en Caracas"
                  className={inputClass}
                />
              </div>
              <button
                onClick={registrarPropiedad}
                className={btnPrimary}
                disabled={loading || !ciDueno || !descripcion}
              >
                {loading
                  ? "Procesando..."
                  : "Registrar Propiedad en Blockchain"}
              </button>
            </div>
          </div>

          {/* 2. Definir Herencia */}
          <div className={cardClass}>
            <div className="flex items-center mb-4 space-x-2 border-b pb-2">
              <span className="text-2xl">📜</span>
              <h2 className="text-xl font-bold text-gray-800">
                Definir Herencia
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de la Propiedad
                </label>
                <input
                  value={idPropiedad}
                  onChange={(e) => setIdPropiedad(e.target.value)}
                  placeholder="ID numérico"
                  className={inputClass}
                  type="number"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <p className="text-sm font-semibold text-gray-600">
                  Agregar Heredero:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={ciHeredero}
                    onChange={(e) => setCiHeredero(e.target.value)}
                    placeholder="CI Heredero"
                    className={inputClass}
                  />
                  <input
                    value={porcentaje}
                    onChange={(e) => setPorcentaje(e.target.value)}
                    placeholder="%"
                    type="number"
                    className={inputClass}
                  />
                </div>
                <button
                  onClick={agregarHeredero}
                  className={`${btnSecondary} bg-indigo-500 hover:bg-indigo-600`}
                >
                  + Agregar a la lista
                </button>
              </div>

              {/* Lista temporal de herederos */}
              {herederos.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <h4 className="text-xs font-bold text-yellow-800 uppercase mb-2">
                    Herederos a registrar:
                  </h4>
                  <ul className="space-y-1">
                    {herederos.map((ci, i) => (
                      <li
                        key={i}
                        className="flex justify-between text-sm text-gray-700 border-b border-yellow-100 last:border-0 pb-1"
                      >
                        <span>👤 CI: {ci}</span>
                        <span className="font-bold">{porcentajes[i]}%</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-right mt-2 text-xs font-bold text-gray-500">
                    Total: {porcentajes.reduce((a, b) => a + b, 0)}%
                  </div>
                </div>
              )}

              <button
                onClick={definirHerencia}
                className={btnPrimary}
                disabled={loading || herederos.length === 0}
              >
                {loading ? "Procesando..." : "Grabar Herencia en Contrato"}
              </button>
            </div>
          </div>
        </div>

        {/* Sección Inferior: Consultas y Ejecución */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Panel de Control */}
          <div className={`${cardClass} md:col-span-1`}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Panel de Control
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  ID Objetivo
                </label>
                <input
                  value={idPropiedad}
                  onChange={(e) => setIdPropiedad(e.target.value)}
                  placeholder="ID Propiedad para consultar"
                  className={`${inputClass} bg-gray-50`}
                  type="number"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={consultarPropiedad}
                  className="bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 font-bold py-2 rounded-lg transition"
                >
                  🔍 Consultar Propiedad
                </button>
                <button
                  onClick={consultarHerencia}
                  className="bg-white border border-purple-500 text-purple-600 hover:bg-purple-50 font-bold py-2 rounded-lg transition"
                >
                  👥 Consultar Herederos
                </button>
                <hr className="border-gray-200 my-2" />
                <button
                  onClick={ejecutarHerencia}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition shadow-md"
                >
                  ⚠️ Ejecutar Herencia
                </button>
              </div>
            </div>
          </div>

          {/* Resultados Visuales */}
          <div className={`${cardClass} md:col-span-2 bg-gray-50`}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Resultados de la Consulta
            </h3>

            {!propiedad && herenciaDefinida.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p>Ingresa un ID y presiona consultar para ver los detalles.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Resultado Propiedad */}
              {propiedad && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="text-blue-800 font-bold mb-2 border-b pb-1">
                    Datos del Bien
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">ID:</span>{" "}
                      {propiedad.idPropiedad}
                    </p>
                    <p>
                      <span className="font-semibold">Descripción:</span>{" "}
                      {propiedad.descripcion}
                    </p>
                    <p>
                      <span className="font-semibold">CI Dueño:</span>{" "}
                      {propiedad.ciDueno}
                    </p>
                    <p className="truncate">
                      <span className="font-semibold">Wallet:</span>{" "}
                      {propiedad.walletDueno}
                    </p>
                    <p>
                      <span className="font-semibold">Estado:</span>{" "}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs text-white ${
                          propiedad.enHerencia ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        {propiedad.enHerencia ? "EN HERENCIA" : "ACTIVO"}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Resultado Herederos */}
              {herenciaDefinida.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="text-purple-800 font-bold mb-2 border-b pb-1">
                    Herederos Registrados
                  </h4>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {herenciaDefinida.map((h, i) => (
                      <li
                        key={i}
                        className="text-sm bg-purple-50 p-2 rounded border border-purple-100"
                      >
                        <div className="flex justify-between font-bold text-purple-900">
                          <span>CI: {h.ciHeredero}</span>
                          <span>{h.porcentaje}%</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {h.walletHeredero}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerenciaComponent;