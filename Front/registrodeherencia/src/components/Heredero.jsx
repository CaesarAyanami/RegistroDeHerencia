import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HerenciaABI from "../ABI/RegistroPropiedadesHerencia.json"; // ABI generado por Truffle

const HerenciaComponent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  // Campos para registrar propiedad
  const [ciDueno, setCiDueno] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Campos para definir herencia
  const [idPropiedad, setIdPropiedad] = useState("");
  const [herederos, setHerederos] = useState([]); // lista de CI
  const [porcentajes, setPorcentajes] = useState([]); // lista de porcentajes
  const [ciHeredero, setCiHeredero] = useState("");
  const [porcentaje, setPorcentaje] = useState("");

  // Resultados de consulta
  const [propiedad, setPropiedad] = useState(null);
  const [herenciaDefinida, setHerenciaDefinida] = useState([]);

<<<<<<< HEAD
  // Estados de UI
  const [loading, setLoading] = useState(false);

  // Helpers
  const truncateAddress = (address) => {
    if (!address) return "N/A";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const withGasPrice = async (web3Instance) => {
    if (!web3Instance) return null;
    return await web3Instance.eth.getGasPrice();
  };

  // Inicialización Web3
=======
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = HerenciaABI.networks[networkId];

<<<<<<< HEAD
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
=======
        if (!deployedNetwork) {
          alert("Contrato no desplegado en esta red");
          return;
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
        }

        const instance = new web3.eth.Contract(
          HerenciaABI.abi,
          deployedNetwork.address
        );
        setContract(instance);
      } else {
        alert("MetaMask no detectado");
      }
    };
    init();
  }, []);

<<<<<<< HEAD
  // Funciones de contrato
=======
  // Registrar propiedad
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
  const registrarPropiedad = async () => {
    try {
      await contract.methods
        .registrarPropiedad(ciDueno, descripcion)
        .send({ from: account });
      alert("Propiedad registrada con éxito");
    } catch (err) {
      console.error(err);
      alert("Error al registrar propiedad");
    }
  };

  // Agregar heredero a la lista temporal
  const agregarHeredero = () => {
<<<<<<< HEAD
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

=======
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
    setHerederos([...herederos, ciHeredero]);
    setPorcentajes([...porcentajes, newPorcentaje]);
    setCiHeredero("");
    setPorcentaje("");
  };

  // Definir herencia
  const definirHerencia = async () => {
<<<<<<< HEAD
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

      // Validar dueño y estado antes de definir
      const p = await contract.methods.obtenerPropiedad(id).call();
      if (!p || !p.idPropiedad) {
        alert("La propiedad no existe.");
        setLoading(false);
        return;
      }
      if (p.walletDueno?.toLowerCase() !== account.toLowerCase()) {
        alert("Solo el dueño puede definir la herencia.");
        setLoading(false);
        return;
      }
      if (p.enHerencia) {
        alert("La herencia ya fue definida para esta propiedad.");
        setLoading(false);
        return;
      }
      if (herederos.length !== porcentajes.length) {
        alert("Herederos y porcentajes no coinciden.");
        setLoading(false);
        return;
      }

      await contract.methods
        .definirHerencia(id, herederos, porcentajes)
        .send({ from: account, gasPrice });

      alert("Herencia definida ✅");
      setIdPropiedad("");
      setHerederos([]);
      setPorcentajes([]);
=======
    try {
      await contract.methods
        .definirHerencia(idPropiedad, herederos, porcentajes)
        .send({ from: account });
      alert("Herencia definida con éxito");
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
    } catch (err) {
      console.error(err);
      alert("Error al definir herencia");
    }
  };

  // Ejecutar herencia
  const ejecutarHerencia = async () => {
<<<<<<< HEAD
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
=======
    try {
      await contract.methods.ejecutarHerencia(idPropiedad).send({ from: account });
      alert("Herencia ejecutada con éxito");
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
    } catch (err) {
      console.error(err);
      alert("Error al ejecutar herencia");
    }
  };

  // Consultar propiedad
  const consultarPropiedad = async () => {
    try {
<<<<<<< HEAD
      const id = parseInt(idPropiedad, 10);
      if (Number.isNaN(id)) {
        alert("ID de propiedad inválido.");
        return;
      }
      const result = await contract.methods.obtenerPropiedad(id).call();
      setPropiedad(result);
    } catch (err) {
      console.error(err);
      setPropiedad(null);
      alert("Error al consultar propiedad ❌");
=======
      const result = await contract.methods.obtenerPropiedad(idPropiedad).call();
      setPropiedad(result);
    } catch (err) {
      console.error(err);
      alert("Error al consultar propiedad");
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
    }
  };

  // Consultar herencia definida
  const consultarHerencia = async () => {
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
<<<<<<< HEAD
      setHerenciaDefinida([]);
      alert("Error al consultar herencia ❌");
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            📜 Gestión de Herencias Digitales
          </h1>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Cuenta conectada: {truncateAddress(account)}
          </div>
=======
      alert("Error al consultar herencia");
    }
  };

  return (
    <div>
      <h2>Registro de Propiedades con Herencia</h2>
      <p>Cuenta conectada: {account}</p>

      <h3>Registrar Propiedad</h3>
      <input
        type="text"
        placeholder="CI Dueño"
        value={ciDueno}
        onChange={(e) => setCiDueno(e.target.value)}
      />
      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <button onClick={registrarPropiedad}>Registrar Propiedad</button>

      <h3>Definir Herencia</h3>
      <input
        type="text"
        placeholder="ID Propiedad"
        value={idPropiedad}
        onChange={(e) => setIdPropiedad(e.target.value)}
      />
      <input
        type="text"
        placeholder="CI Heredero"
        value={ciHeredero}
        onChange={(e) => setCiHeredero(e.target.value)}
      />
      <input
        type="number"
        placeholder="Porcentaje"
        value={porcentaje}
        onChange={(e) => setPorcentaje(e.target.value)}
      />
      <button onClick={agregarHeredero}>Agregar Heredero</button>
      <button onClick={definirHerencia}>Definir Herencia</button>

      <h4>Herederos agregados:</h4>
      <ul>
        {herederos.map((ci, index) => (
          <li key={index}>
            {ci} - {porcentajes[index]}%
          </li>
        ))}
      </ul>

      <h3>Ejecutar Herencia</h3>
      <button onClick={ejecutarHerencia}>Ejecutar Herencia</button>

      <h3>Consultar Propiedad</h3>
      <button onClick={consultarPropiedad}>Consultar Propiedad</button>
      {propiedad && (
        <div>
          <h4>Datos de la Propiedad</h4>
          <p>ID: {propiedad.idPropiedad}</p>
          <p>Descripción: {propiedad.descripcion}</p>
          <p>CI Dueño: {propiedad.ciDueno}</p>
          <p>Wallet Dueño: {propiedad.walletDueno}</p>
          <p>En Herencia: {propiedad.enHerencia ? "Sí" : "No"}</p>
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
        </div>
      )}

<<<<<<< HEAD
        {/* Módulos de Operación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registrar Propiedad */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-t-blue-600">
            <h3 className="text-xl font-bold text-gray-800">
              🏠 Registrar Propiedad
            </h3>
            <input
              type="text"
              placeholder="CI del dueño"
              value={ciDueno}
              onChange={(e) => setCiDueno(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Descripción del bien"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={registrarPropiedad}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 disabled:opacity-50"
              disabled={loading || !contract || !ciDueno || !descripcion}
            >
              {loading ? "Registrando..." : "Registrar Propiedad"}
            </button>
          </div>

          {/* Definir Herencia */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-t-purple-600">
            <h3 className="text-xl font-bold text-gray-800">
              ✍️ Definir Plan de Herencia
            </h3>
            <input
              type="text"
              placeholder="ID Propiedad a Heredar"
              value={idPropiedad}
              onChange={(e) => setIdPropiedad(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="CI Heredero"
                value={ciHeredero}
                onChange={(e) => setCiHeredero(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="%"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                className="w-24 px-4 py-2 border rounded-lg"
                min="1"
                max="100"
              />
              <button
                onClick={agregarHeredero}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg"
                disabled={!ciHeredero || !porcentaje || loading}
              >
                + Add
              </button>
            </div>

            <h4 className="font-semibold mt-2 text-sm text-gray-700">
              Distribución ({porcentajes.reduce((a, b) => a + b, 0)}%):
            </h4>
            <ul className="space-y-1 max-h-24 overflow-y-auto p-2 bg-gray-50 rounded-lg border">
              {herederos.length > 0 ? (
                herederos.map((ci, index) => (
                  <li
                    key={index}
                    className="flex justify-between text-xs text-gray-700"
                  >
                    <span>CI: {ci}</span>
                    <span className="font-bold text-purple-700">
                      {porcentajes[index]}%
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-xs text-center">
                  Agregue herederos.
                </li>
              )}
            </ul>

            <button
              onClick={definirHerencia}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg mt-2 disabled:opacity-50"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ejecutar Herencia */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-t-green-600">
            <h3 className="text-xl font-bold text-gray-800">
              ⚰️ Ejecutar Herencia
            </h3>
            <input
              type="text"
              placeholder="ID Propiedad a Ejecutar"
              value={idPropiedad}
              onChange={(e) => setIdPropiedad(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={ejecutarHerencia}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2 disabled:opacity-50"
              disabled={loading || !contract || !idPropiedad}
            >
              {loading ? "Ejecutando..." : "Ejecutar Transferencia a Herederos"}
            </button>
          </div>

          {/* Consulta de Propiedad */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-t-yellow-600">
            <h3 className="text-xl font-bold text-gray-800">
              🔍 Consultar Estado de Propiedad
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID Propiedad"
                value={idPropiedad}
                onChange={(e) => setIdPropiedad(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                onClick={consultarPropiedad}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={!idPropiedad}
              >
                Ver
              </button>
            </div>

            {propiedad && (
              <div className="mt-2 text-sm space-y-1 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
                <p>
                  <strong className="text-yellow-800">ID:</strong>{" "}
                  {propiedad.idPropiedad}
                </p>
                <p>
                  <strong className="text-yellow-800">CI Dueño:</strong>{" "}
                  {propiedad.ciDueno}
                </p>
                <p>
                  <strong className="text-yellow-800">Descripción:</strong>{" "}
                  {propiedad.descripcion}
                </p>
                <p>
                  <strong className="text-yellow-800">En Herencia:</strong>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-t-indigo-600">
            <h3 className="text-xl font-bold text-gray-800">
              🤝 Consultar Distribución
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID Propiedad"
                value={idPropiedad}
                onChange={(e) => setIdPropiedad(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <button
                onClick={consultarHerencia}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
                disabled={!idPropiedad}
              >
                Ver
              </button>
            </div>

            {herenciaDefinida.length > 0 ? (
              <div className="mt-2 text-sm space-y-1 max-h-40 overflow-y-auto p-3 bg-indigo-50 rounded-lg border border-indigo-300">
                <p className="font-bold text-indigo-800">
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
              herenciaDefinida.length === 0 &&
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
=======
      <h3>Consultar Herencia</h3>
      <button onClick={consultarHerencia}>Consultar Herencia</button>
      {herenciaDefinida.length > 0 && (
        <div>
          <h4>Herencia definida</h4>
          <ul>
            {herenciaDefinida.map((h, index) => (
              <li key={index}>
                CI: {h.ciHeredero}, Wallet: {h.walletHeredero}, Porcentaje: {h.porcentaje}%
              </li>
            ))}
          </ul>
        </div>
      )}
>>>>>>> parent of ce4c57b (funcionalidades agregadas y estilos a personas y propiedad)
    </div>
  );
};

export default HerenciaComponent;
