import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PersonasABI from "../ABI/Personas.json"; // ABI generado por Truffle

// Componente de Notificación simple
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses =
    "p-3 mb-4 rounded-lg shadow-lg text-white font-medium flex justify-between items-center";
  let colorClasses = "";

  switch (type) {
    case "success":
      colorClasses = "bg-green-500";
      break;
    case "error":
      colorClasses = "bg-red-500";
      break;
    case "info":
      colorClasses = "bg-blue-500";
      break;
    case "alert": // Tipo para IDs importantes
      colorClasses = "bg-yellow-600";
      break;
    default:
      colorClasses = "bg-blue-500";
      break;
  }

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-100 font-bold leading-none"
      >
        &times;
      </button>
    </div>
  );
};

const PersonasComponent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  // Estados de Notificación
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Estado para controlar si los datos de registro completo han sido verificados
  const [isIDVerified, setIsIDVerified] = useState(false);

  // 1. CAMPOS DE REGISTRO ESENCIAL
  const [cedulaEsencial, setCedulaEsencial] = useState("");
  const [nombresEsencial, setNombresEsencial] = useState("");
  const [apellidosEsencial, setApellidosEsencial] = useState("");

  // 2. CAMPOS DE REGISTRO COMPLETO/ACTUALIZACIÓN
  const [idPersonaCompleto, setIdPersonaCompleto] = useState("");
  const [cedulaCompleto, setCedulaCompleto] = useState("");
  const [nombresCompleto, setNombresCompleto] = useState("");
  const [apellidosCompleto, setApellidosCompleto] = useState("");

  const [genero, setGenero] = useState(2);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [lugarNacimiento, setLugarNacimiento] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [profesion, setProfesion] = useState("");

  // 3. CAMPOS DE CONSULTA
  const [cedulaConsulta, setCedulaConsulta] = useState("");
  const [idConsulta, setIdConsulta] = useState("");

  // Resultados de consultas
  const [persona, setPersona] = useState(null);
  const [personaPorId, setPersonaPorId] = useState(null);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    // Damos más tiempo para ver IDs importantes
    setTimeout(
      () => setNotification({ message: "", type: "" }),
      type === "alert" ? 12000 : 5000
    );
  };

  useEffect(() => {
    // Lógica de inicialización
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = PersonasABI.networks[networkId];

          if (!deployedNetwork) {
            showNotification(
              "Contrato no desplegado en esta red. Revisa tu configuración.",
              "error"
            );
            return;
          }

          const instance = new web3.eth.Contract(
            PersonasABI.abi,
            deployedNetwork.address
          );
          setContract(instance);
          showNotification(
            "Conexión con la red y contrato exitosa.",
            "success"
          );
        } catch (error) {
          console.error("Error al inicializar:", error);
          showNotification(
            "Error al conectar con MetaMask o cargar el contrato.",
            "error"
          );
        }
      } else {
        showNotification(
          "MetaMask no detectado. Instala la extensión para usar la aplicación.",
          "error"
        );
      }
    };
    init();
  }, []);

  // Clases comunes de Tailwind
  const inputClasses =
    "w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
  const buttonClasses =
    "px-4 py-2 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out disabled:opacity-50";
  const primaryButtonClasses = `${buttonClasses} bg-blue-600 hover:bg-blue-700`;
  const secondaryButtonClasses = `${buttonClasses} bg-gray-600 hover:bg-gray-700`;
  const containerClasses = "bg-white p-6 rounded-xl shadow-2xl space-y-4";
  const sectionTitleClasses =
    "text-xl font-bold text-gray-800 border-b pb-2 mb-4";
  const resultCardClasses =
    "bg-blue-50 border-l-4 border-blue-500 p-4 mt-4 rounded-lg";
  const gridClasses = "grid grid-cols-1 md:grid-cols-3 gap-4";

  // Función de utilería para convertir timestamp de Solidity a formato YYYY-MM-DD
  const formatTimestampToDateInput = (timestampStr) => {
    const timestamp = Number(timestampStr);
    if (timestamp === 0) return "";
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Función para resetear todos los campos del Registro Completo
  const resetCamposCompletos = () => {
    setCedulaCompleto("");
    setNombresCompleto("");
    setApellidosCompleto("");
    setGenero(2);
    setFechaNacimiento("");
    setLugarNacimiento("");
    setEstadoCivil("");
    setDireccion("");
    setTelefono("");
    setProfesion("");
    setIsIDVerified(false);
  };

  // VERIFICAR ID Y PRECARGAR DATOS
  const verificarIdYPrecargar = async () => {
    if (!contract) return;
    if (!idPersonaCompleto) {
      showNotification("Introduce el ID Persona para verificar.", "error");
      return;
    }

    try {
      const result = await contract.methods
        .obtenerPersonaPorId(idPersonaCompleto)
        .call();
      const idStr = String(result.id || 0);

      if (
        result &&
        result.nombres &&
        result.nombres !== "" &&
        idStr === idPersonaCompleto
      ) {
        // ID EXISTE y tiene datos. Precargar campos.
        setCedulaCompleto(result.cedula);
        setNombresCompleto(result.nombres);
        setApellidosCompleto(result.apellidos);
        setGenero(Number(result.genero));
        setFechaNacimiento(formatTimestampToDateInput(result.fechaNacimiento));
        setLugarNacimiento(result.lugarNacimiento);
        setEstadoCivil(result.estadoCivil);
        setDireccion(result.direccion);
        setTelefono(result.telefono);
        setProfesion(result.profesion);

        setIsIDVerified(true);
        showNotification(
          `ID ${idPersonaCompleto} encontrado. Campos precargados para actualización.`,
          "success"
        );
      } else {
        // ID NO EXISTE o está vacío. Permitir registro inicial completo.
        resetCamposCompletos();
        setIsIDVerified(true);
        showNotification(
          `ID ${idPersonaCompleto} NO encontrado. Puedes registrar una persona completa con este ID.`,
          "info"
        );
      }
    } catch (err) {
      console.error(err);
      resetCamposCompletos();
      showNotification("Error al verificar el ID. Revisa la consola.", "error");
    }
  };

  // REGISTRAR PERSONA ESENCIAL (IMPLEMENTACIÓN DE CAPTURA DE ID)
  const registrarPersonaEsencial = async () => {
    if (!contract) {
      showNotification("Contrato no inicializado", "error");
      return;
    }
    if (!cedulaEsencial || !nombresEsencial || !apellidosEsencial) {
      showNotification(
        "Los campos Cédula, Nombres y Apellidos son obligatorios para el registro esencial.",
        "error"
      );
      return;
    }
    try {
      const web3 = new Web3(window.ethereum);

      const gasPrice = await web3.eth.getGasPrice();

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const receipt = await contract.methods
        .registrarPersonaEsencial(
          cedulaEsencial,
          nombresEsencial,
          apellidosEsencial,
          account
        )
        .send({ from: account, gasPrice }); // 👈 aquí la corrección

      let newId = null;

      if (receipt.events && receipt.events.PersonaRegistrada) {
        newId = receipt.events.PersonaRegistrada.returnValues.id;
      }

      if (newId) {
        showNotification(
          `✅ Persona esencial registrada con éxito. ¡IMPORTANTE! La ID asignada es: ${newId}.`,
          "alert"
        );

        setIdPersonaCompleto(newId);
        setIsIDVerified(true);
        setCedulaCompleto(cedulaEsencial);
        setNombresCompleto(nombresEsencial);
        setApellidosCompleto(apellidosEsencial);
      } else {
        showNotification(
          "Persona esencial registrada con éxito, pero la ID no pudo ser recuperada automáticamente. Por favor, use la función de consulta por ID para encontrarla.",
          "success"
        );
      }

      setCedulaEsencial("");
      setNombresEsencial("");
      setApellidosEsencial("");
    } catch (err) {
      console.error(err);
      showNotification(
        "Error al registrar persona esencial. (Verifica si ya existe o si la transacción fue rechazada)",
        "error"
      );
    }
  };

  // REGISTRAR PERSONA COMPLETA (sin cambios)
  const registrarPersonaCompleta = async () => {
    if (!contract) {
      showNotification("Contrato no inicializado", "error");
      return;
    }
    if (!isIDVerified) {
      showNotification("Primero debes verificar el ID de la persona.", "error");
      return;
    }
    if (
      !idPersonaCompleto ||
      !cedulaCompleto ||
      !nombresCompleto ||
      !apellidosCompleto
    ) {
      showNotification(
        "Los campos ID Persona, Cédula, Nombres y Apellidos del Registro Completo son obligatorios.",
        "error"
      );
      return;
    }
    try {
      const timestamp = fechaNacimiento
        ? Math.floor(new Date(fechaNacimiento).getTime() / 1000)
        : 0;

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      // Obtén el gasPrice actual de la red
      const gasPrice = await web3.eth.getGasPrice();

      await contract.methods
        .registrarPersona(
          idPersonaCompleto,
          nombresCompleto,
          apellidosCompleto,
          cedulaCompleto,
          genero,
          timestamp,
          lugarNacimiento,
          estadoCivil,
          direccion,
          telefono,
          profesion,
          account
        )
        .send({ from: account, gasPrice }); // 👈 aquí está la corrección

      showNotification("Persona registrada/actualizada con éxito", "success");
    } catch (err) {
      console.error(err);
      showNotification(
        "Error al registrar persona completa. (Verifica el ID, permisos o si la transacción fue rechazada)",
        "error"
      );
    }
  };

  // Funciones de consulta (sin cambios)
  const consultarPersonaPorCI = async () => {
    if (!contract) return;
    setPersona(null);
    if (!cedulaConsulta) {
      showNotification("Introduce una Cédula para consultar.", "error");
      return;
    }
    try {
      const result = await contract.methods
        .obtenerPersonaPorCI(cedulaConsulta)
        .call();
      if (result && result.nombres && result.nombres !== "") {
        setPersona(result);
        showNotification(
          `Persona con CI ${cedulaConsulta} encontrada.`,
          "info"
        );
      } else {
        setPersona(null);
        showNotification(
          `No se encontró persona con CI ${cedulaConsulta}.`,
          "info"
        );
      }
    } catch (err) {
      console.error(err);
      setPersona(null);
      showNotification(
        "Error al consultar persona por CI. Asegúrate que la cédula sea válida.",
        "error"
      );
    }
  };

  const consultarPersonaPorId = async () => {
    if (!contract) return;
    setPersonaPorId(null);
    if (!idConsulta) {
      showNotification("Introduce un ID Persona para consultar.", "error");
      return;
    }
    try {
      const result = await contract.methods
        .obtenerPersonaPorId(idConsulta)
        .call();
      const idStr = String(result.id || 0);

      if (result && result.nombres && result.nombres !== "" && idStr !== "0") {
        setPersonaPorId({ ...result, id: idStr });
        showNotification(`Persona con ID ${idConsulta} encontrada.`, "info");
      } else {
        setPersonaPorId(null);
        showNotification(
          `No se encontró persona con ID ${idConsulta}.`,
          "info"
        );
      }
    } catch (err) {
      console.error(err);
      setPersonaPorId(null);
      showNotification(
        "Error al consultar persona por ID. Asegúrate que el ID sea válido.",
        "error"
      );
    }
  };

  // Funciones de formato (sin cambios)
  const getGeneroText = (value) => {
    const gen = Number(value);
    switch (gen) {
      case 0:
        return "Masculino";
      case 1:
        return "Femenino";
      case 2:
        return "Otro";
      default:
        return "Desconocido";
    }
  };
  const formatFechaNacimientoDisplay = (timestampStr) => {
    const timestamp = Number(timestampStr);
    if (timestamp === 0) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          DApp de Gestión de Personas 🧑‍💻
        </h1>

        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "" })}
        />

        <div className="text-center mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg text-gray-700">
          <p>
            Cuenta conectada:{" "}
            <span className="font-mono font-semibold text-blue-800 break-all">
              {account || "No conectada"}
            </span>
          </p>
        </div>

        {/* CONTENEDOR PRINCIPAL: Flex para separar Registro (izquierda) y Consultas (derecha) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* --- COLUMNA DE REGISTRO (Ocupa 2/3 en pantallas grandes) --- */}
          <div className="lg:w-2/3 space-y-8">
            {/* --- 1. Sección de Registro Esencial --- */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>
                1. Registro Esencial (Nuevas Personas)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Solo registra la información mínima y la wallet. La ID generada
                será mostrada y precargada en la sección de Actualización.
              </p>

              <div className={gridClasses}>
                <input
                  type="text"
                  placeholder="Cédula (Esencial)"
                  value={cedulaEsencial}
                  onChange={(e) => setCedulaEsencial(e.target.value)}
                  className={inputClasses}
                />
                <input
                  type="text"
                  placeholder="Nombres (Esencial)"
                  value={nombresEsencial}
                  onChange={(e) => setNombresEsencial(e.target.value)}
                  className={inputClasses}
                />
                <input
                  type="text"
                  placeholder="Apellidos (Esencial)"
                  value={apellidosEsencial}
                  onChange={(e) => setApellidosEsencial(e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="flex justify-start space-x-4 mt-4">
                <button
                  onClick={registrarPersonaEsencial}
                  className={primaryButtonClasses}
                  disabled={!contract}
                >
                  Registrar Esencial
                </button>
              </div>
            </div>

            {/* --- 2. Sección de Registro Completo/Actualización --- */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>
                2. Registro Completo / Actualización
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Completa los datos de una persona existente o registra una nueva
                con toda la información.
              </p>

              {/* Sección de verificación de ID */}
              <div className="flex space-x-2 mb-4 items-center">
                <input
                  type="number"
                  placeholder="ID Persona (Requerido)"
                  value={idPersonaCompleto}
                  onChange={(e) => {
                    setIdPersonaCompleto(e.target.value);
                    setIsIDVerified(false);
                  }}
                  className={inputClasses + " w-full md:w-1/3"}
                />
                <button
                  onClick={verificarIdYPrecargar}
                  className={`${secondaryButtonClasses} bg-purple-600 hover:bg-purple-700`}
                  disabled={!contract || !idPersonaCompleto}
                >
                  Verificar ID
                </button>
                {isIDVerified && (
                  <span className="p-2 border rounded-lg bg-green-100 text-green-700 font-semibold flex items-center">
                    ID Verificado ✅
                  </span>
                )}
              </div>

              {/* Campos de datos completos (Visibles y editables SÓLO después de la verificación) */}
              <fieldset disabled={!isIDVerified} className="space-y-4">
                <legend className="text-sm font-semibold text-gray-700 border-t pt-2">
                  Datos a Registrar/Actualizar:
                </legend>

                {/* Datos básicos del registro completo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Cédula (Completo)"
                    value={cedulaCompleto}
                    onChange={(e) => setCedulaCompleto(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Nombres (Completo)"
                    value={nombresCompleto}
                    onChange={(e) => setNombresCompleto(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Apellidos (Completo)"
                    value={apellidosCompleto}
                    onChange={(e) => setApellidosCompleto(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                {/* Datos Adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="date"
                    placeholder="Fecha Nacimiento"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className={inputClasses}
                  />
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className={inputClasses}
                  >
                    <option value={2}>Otro/Género</option>
                    <option value={0}>Masculino</option>
                    <option value={1}>Femenino</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Lugar Nacimiento"
                    value={lugarNacimiento}
                    onChange={(e) => setLugarNacimiento(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Estado Civil"
                    value={estadoCivil}
                    onChange={(e) => setEstadoCivil(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Dirección"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className={inputClasses}
                  />
                  <input
                    type="text"
                    placeholder="Profesión"
                    value={profesion}
                    onChange={(e) => setProfesion(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </fieldset>

              <div className="flex justify-start space-x-4 mt-4 pt-4 border-t">
                <button
                  onClick={registrarPersonaCompleta}
                  className={primaryButtonClasses}
                  disabled={!contract || !isIDVerified}
                >
                  Registrar/Actualizar Completo
                </button>
                <button
                  onClick={() => {
                    setIdPersonaCompleto("");
                    resetCamposCompletos();
                  }}
                  className={`${secondaryButtonClasses} bg-red-500 hover:bg-red-600`}
                >
                  Limpiar Formulario
                </button>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DE CONSULTAS (Ocupa 1/3 en pantallas grandes) --- */}
          <div className="lg:w-1/3 space-y-8">
            {/* --- 3. Consulta por Cédula (CI) --- */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>
                3. Consulta por Cédula (CI)
              </h2>

              <input
                type="text"
                placeholder="Cédula a Consultar"
                value={cedulaConsulta}
                onChange={(e) => setCedulaConsulta(e.target.value)}
                className={inputClasses + " mb-4"}
              />

              <button
                onClick={consultarPersonaPorCI}
                className={`${secondaryButtonClasses} w-full`}
                disabled={!contract}
              >
                Consultar Persona por CI
              </button>

              {persona && (
                <div className={resultCardClasses + " mt-4"}>
                  <h4 className="text-lg font-bold mb-2 text-blue-800">
                    ✅ Resultado por Cédula
                  </h4>
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
                    <strong>Wallet:</strong>{" "}
                    <span className="font-mono text-sm break-all">
                      {persona.wallet}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* --- 4. Consulta por ID --- */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>4. Consulta por ID</h2>

              <input
                type="text"
                placeholder="ID a Consultar"
                value={idConsulta}
                onChange={(e) => setIdConsulta(e.target.value)}
                className={inputClasses + " mb-4"}
              />

              <button
                onClick={consultarPersonaPorId}
                className={`${secondaryButtonClasses} w-full bg-indigo-600 hover:bg-indigo-700`}
                disabled={!contract}
              >
                Consultar Persona por ID
              </button>

              {personaPorId && (
                <div
                  className={
                    resultCardClasses + " border-indigo-700 bg-indigo-50 mt-4"
                  }
                >
                  <h4 className="text-lg font-bold mb-2 text-indigo-800">
                    🔎 Resultado por ID
                  </h4>
                  <p>
                    <strong>ID:</strong> {personaPorId.id}
                  </p>
                  <p>
                    <strong>Nombres:</strong> {personaPorId.nombres}
                  </p>
                  <p>
                    <strong>Apellidos:</strong> {personaPorId.apellidos}
                  </p>
                  <p>
                    <strong>Cédula:</strong> {personaPorId.cedula}
                  </p>
                  <p>
                    <strong>Género:</strong>{" "}
                    {getGeneroText(personaPorId.genero)}
                  </p>
                  <p>
                    <strong>Fecha Nacimiento:</strong>{" "}
                    {formatFechaNacimientoDisplay(personaPorId.fechaNacimiento)}
                  </p>
                  <p>
                    <strong>Lugar Nacimiento:</strong>{" "}
                    {personaPorId.lugarNacimiento || "N/A"}
                  </p>
                  <p>
                    <strong>Estado Civil:</strong>{" "}
                    {personaPorId.estadoCivil || "N/A"}
                  </p>
                  <p>
                    <strong>Dirección:</strong>{" "}
                    {personaPorId.direccion || "N/A"}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {personaPorId.telefono || "N/A"}
                  </p>
                  <p>
                    <strong>Profesión:</strong>{" "}
                    {personaPorId.profesion || "N/A"}
                  </p>
                  <p>
                    <strong>Wallet:</strong>{" "}
                    <span className="font-mono text-sm break-all">
                      {personaPorId.wallet}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonasComponent;
