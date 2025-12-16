import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HerenciaABI from "../ABI/RegistroPropiedadesHerencia.json";

// Helper para truncar la dirección (usado en el ejemplo anterior)
const truncateAddress = (address) => {
  if (!address) return "N/A";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
};

const HerenciaComponent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false); // Añadido estado de carga

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

  // Inicialización Web3
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
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
          alert(
            "Error al inicializar la conexión con MetaMask o cargar el contrato."
          );
        }
      } else {
        alert("MetaMask no detectado");
      }
    };
    init();
  }, []);

  // Funciones de contrato
  const withGasPrice = async (web3Instance) => {
    if (!web3Instance) return null;
    return await web3Instance.eth.getGasPrice();
  };

  const registrarPropiedad = async () => {
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await withGasPrice(web3);
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
    const currentTotal = porcentajes.reduce((a, b) => a + b, 0);
    const newPorcentaje = parseInt(porcentaje, 10);

    if (!Number.isInteger(newPorcentaje) || newPorcentaje <= 0) {
      alert("El porcentaje debe ser un entero mayor a 0.");
      return;
    }
    if (currentTotal + newPorcentaje > 100) {
      alert(`La suma excede el 100%. Total actual: ${currentTotal}%.`);
      return;
    }

    setHerederos([...herederos, ciHeredero]);
    setPorcentajes([...porcentajes, newPorcentaje]);
    setCiHeredero("");
    setPorcentaje("");
  };

  const definirHerencia = async () => {
    const total = porcentajes.reduce((a, b) => a + b, 0);
    if (total !== 100) {
      alert(`Los porcentajes suman ${total}%. Deben sumar exactamente 100%.`);
      return;
    }
    if (!idPropiedad || herederos.length === 0) {
      alert("Debe seleccionar una propiedad y agregar al menos un heredero.");
      return;
    }

    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await withGasPrice(web3);
      const id = parseInt(idPropiedad, 10);
      if (Number.isNaN(id)) {
        alert("ID de propiedad inválido.");
        setLoading(false);
        return;
      }

      // Validación de dueño (se asume que se hace la validación en el contrato, pero se puede hacer un chequeo previo)
      await contract.methods
        .definirHerencia(id, herederos, porcentajes)
        .send({ from: account, gasPrice });

      alert("Herencia definida ✅");
      setIdPropiedad("");
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
    if (!idPropiedad) {
      alert("Ingrese el ID de la propiedad para ejecutar la herencia.");
      return;
    }
    setLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const gasPrice = await withGasPrice(web3);
      const id = parseInt(idPropiedad, 10);
      if (Number.isNaN(id)) {
        alert("ID de propiedad inválido.");
        setLoading(false);
        return;
      }
      await contract.methods
        .ejecutarHerencia(id)
        .send({ from: account, gasPrice });
      alert("Herencia ejecutada ✅");
      setIdPropiedad("");
      setPropiedad(null);
      setHerenciaDefinida([]);
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
      const id = parseInt(idPropiedad, 10);
      if (Number.isNaN(id)) {
        alert("ID de propiedad inválido.");
        return;
      }
      const result = await contract.methods.obtenerPropiedad(id).call();
      setPropiedad(result);
      setHerenciaDefinida([]); // Limpiar herencia
    } catch (err) {
      console.error(err);
      setPropiedad(null);
      alert("Error al consultar propiedad ❌");
    }
  };

  const consultarHerencia = async () => {
    if (!idPropiedad) return;
    try {
      const id = parseInt(idPropiedad, 10);
      if (Number.isNaN(id)) {
        alert("ID de propiedad inválido.");
        return;
      }
      const result = await contract.methods.obtenerHerencia(id).call();
      setHerenciaDefinida(result);
    } catch (err) {
      console.error(err);
      setHerenciaDefinida([]);
      alert("Error al consultar herencia ❌");
    }
  };

  // Render con estilos Tailwind CSS
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            📜 Gestión de Herencias Digitales
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
            <span
              className={`w-2 h-2 ${
                account ? "bg-green-400" : "bg-red-400"
              } rounded-full mr-2`}
            ></span>
            Cuenta conectada: {truncateAddress(account)}
          </div>
        </div>

        {/* Módulos de Operación (Registro y Definición) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registrar Propiedad */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-blue-600 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🏠 Registrar Propiedad
            </h3>
            <input
              type="text"
              placeholder="CI del dueño"
              value={ciDueno}
              onChange={(e) => setCiDueno(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <input
              type="text"
              placeholder="Descripción del bien"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
            <button
              onClick={registrarPropiedad}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              disabled={loading || !contract || !ciDueno || !descripcion}
            >
              {loading ? "Registrando..." : "Registrar Propiedad"}
            </button>
          </div>

          {/* Definir Herencia */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-purple-600 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              ✍️ Definir Plan de Herencia
            </h3>
            <input
              type="text"
              placeholder="ID Propiedad a Heredar"
              value={idPropiedad}
              onChange={(e) => setIdPropiedad(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition duration-150"
            />

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="CI Heredero"
                value={ciHeredero}
                onChange={(e) => setCiHeredero(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="%"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-center"
                min="1"
                max="100"
              />
              <button
                onClick={agregarHeredero}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150"
                disabled={!ciHeredero || !porcentaje || loading}
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">
                Distribución ({porcentajes.reduce((a, b) => a + b, 0)}%):
              </h4>
              <ul className="space-y-1 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                {herederos.length > 0 ? (
                  herederos.map((ci, index) => (
                    <li
                      key={index}
                      className="flex justify-between text-sm text-gray-800 border-b border-gray-200 last:border-b-0 py-1"
                    >
                      <span>CI: {ci}</span>
                      <span className="font-bold text-purple-700">
                        {porcentajes[index]}%
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 text-sm text-center py-2">
                    Agregue herederos.
                  </li>
                )}
              </ul>
            </div>

            <button
              onClick={definirHerencia}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              disabled={
                loading ||
                !contract ||
                herederos.length === 0 ||
                porcentajes.reduce((a, b) => a + b, 0) !== 100
              }
            >
              {loading ? "Definiendo..." : "Finalizar Definición (100%)"}
            </button>
          </div>
        </div>

        {/* Módulos de Ejecución y Consulta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ejecutar Herencia */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-green-600 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              ⚰️ Ejecutar Herencia
            </h3>
            <input
              type="text"
              placeholder="ID Propiedad a Ejecutar"
              value={idPropiedad}
              onChange={(e) => setIdPropiedad(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
            />
            <button
              onClick={ejecutarHerencia}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
              disabled={loading || !contract || !idPropiedad}
            >
              {loading ? "Ejecutando..." : "Ejecutar Transferencia"}
            </button>
          </div>

          {/* Consulta de Propiedad */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-yellow-600 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🔍 Consultar Propiedad
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID Propiedad"
                value={idPropiedad}
                onChange={(e) => setIdPropiedad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={consultarPropiedad}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150"
                disabled={!idPropiedad}
              >
                Ver
              </button>
            </div>

            {propiedad && (
              <div className="mt-2 text-sm space-y-1 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
                <p>
                  <strong>ID:</strong> {propiedad.idPropiedad}
                </p>
                <p>
                  <strong>Descripción:</strong> {propiedad.descripcion}
                </p>
                <p>
                  <strong>CI Dueño:</strong> {propiedad.ciDueno}
                </p>
                <p>
                  <strong>Wallet Dueño:</strong>{" "}
                  {truncateAddress(propiedad.walletDueno)}
                </p>
                <p>
                  <strong>En Herencia:</strong>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      propiedad.enHerencia
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {propiedad.enHerencia ? "SÍ (Definida)" : "NO"}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Consulta de Distribución */}
          <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-t-indigo-600 space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              🤝 Consultar Distribución
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID Propiedad"
                value={idPropiedad}
                onChange={(e) => setIdPropiedad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={consultarHerencia}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150"
                disabled={!idPropiedad}
              >
                Ver
              </button>
            </div>

            {herenciaDefinida.length > 0 ? (
              <div className="mt-2 text-sm space-y-1 max-h-40 overflow-y-auto p-3 bg-indigo-50 rounded-lg border border-indigo-300">
                <p className="font-bold text-indigo-800 border-b pb-1">
                  Plan de Distribución:
                </p>
                <ul className="space-y-1">
                  {herenciaDefinida.map((h, index) => (
                    <li
                      key={index}
                      className="flex justify-between text-xs text-gray-700 border-b border-indigo-200 pb-1"
                    >
                      <span>CI: {h.ciHeredero}</span>
                      <span className="font-bold text-indigo-700">
                        {h.porcentaje}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {truncateAddress(h.walletHeredero)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              propiedad &&
              String(propiedad.idPropiedad) === String(idPropiedad) && (
                <div className="mt-2 text-sm p-3 bg-gray-50 rounded-lg border border-gray-300 text-gray-500">
                  No se ha definido un plan de herencia para esta propiedad.
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerenciaComponent;
