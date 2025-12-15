import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HerenciaABI from "../ABI/RegistroPropiedadesHerencia.json";
import PersonasABI from "../ABI/Personas.json";

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const baseClasses = "p-3 mb-4 rounded-lg shadow-lg text-white font-medium flex justify-between items-center";
  let colorClasses = "";

  switch (type) {
    case 'success':
      colorClasses = "bg-green-500";
      break;
    case 'error':
      colorClasses = "bg-red-500";
      break;
    case 'info':
      colorClasses = "bg-blue-500";
      break;
    case 'alert':
      colorClasses = "bg-yellow-600";
      break;
    default:
      colorClasses = "bg-blue-500";
      break;
  }

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-100 font-bold leading-none">
        &times;
      </button>
    </div>
  );
};

const HerenciaComponent = () => {
  const [account, setAccount] = useState("");
  const [herenciaContract, setHerenciaContract] = useState(null);
  const [personasContract, setPersonasContract] = useState(null);
  
  const [notification, setNotification] = useState({ message: '', type: '' });

  // 1. REGISTRO DE PROPIEDAD
  const [cedulaPropietario, setCedulaPropietario] = useState("");
  const [descripcionPropiedad, setDescripcionPropiedad] = useState("");

  // 2. DEFINIR HERENCIA
  const [idPropiedadHerencia, setIdPropiedadHerencia] = useState("");
  const [propiedadInfo, setPropiedadInfo] = useState(null);
  const [herederosInput, setHerederosInput] = useState("");
  const [porcentajesInput, setPorcentajesInput] = useState("");
  const [herenciaDefinida, setHerenciaDefinida] = useState([]);

  // 3. EJECUTAR HERENCIA
  const [idPropiedadEjecutar, setIdPropiedadEjecutar] = useState("");

  // 4. CONSULTAS
  const [idPropiedadConsultar, setIdPropiedadConsultar] = useState("");
  const [propiedadConsultada, setPropiedadConsultada] = useState(null);
  const [herenciaConsultada, setHerenciaConsultada] = useState([]);
  const [cedulaConsultaPropiedades, setCedulaConsultaPropiedades] = useState("");
  const [propiedadesPersona, setPropiedadesPersona] = useState([]);

  // Clases comunes
  const inputClasses = "w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";
  const buttonClasses = "px-4 py-2 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out disabled:opacity-50";
  const primaryButtonClasses = `${buttonClasses} bg-blue-600 hover:bg-blue-700`;
  const secondaryButtonClasses = `${buttonClasses} bg-gray-600 hover:bg-gray-700`;
  const dangerButtonClasses = `${buttonClasses} bg-red-600 hover:bg-red-700`;
  const containerClasses = "bg-white p-6 rounded-xl shadow-2xl space-y-4";
  const sectionTitleClasses = "text-xl font-bold text-gray-800 border-b pb-2 mb-4";
  const resultCardClasses = "bg-blue-50 border-l-4 border-blue-500 p-4 mt-4 rounded-lg";

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 5000);
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          // Cargar contrato de Herencia
          const networkId = await web3.eth.net.getId();
          const deployedNetworkHerencia = HerenciaABI.networks[networkId];
          
          if (!deployedNetworkHerencia) {
            showNotification("Contrato de Herencia no desplegado en esta red.", 'error');
            return;
          }

          const herenciaInstance = new web3.eth.Contract(
            HerenciaABI.abi,
            deployedNetworkHerencia.address
          );
          setHerenciaContract(herenciaInstance);

          // Cargar contrato de Personas (necesario para validaciones)
          const deployedNetworkPersonas = PersonasABI.networks[networkId];
          if (deployedNetworkPersonas) {
            const personasInstance = new web3.eth.Contract(
              PersonasABI.abi,
              deployedNetworkPersonas.address
            );
            setPersonasContract(personasInstance);
          }

          showNotification("Conexión exitosa con los contratos.", 'success');
        } catch (error) {
          console.error("Error al inicializar:", error);
          showNotification("Error al conectar con MetaMask.", 'error');
        }
      } else {
        showNotification("MetaMask no detectado.", 'error');
      }
    };
    init();
  }, []);

  // 1. REGISTRAR PROPIEDAD
  const registrarPropiedad = async () => {
    if (!herenciaContract) {
      showNotification("Contrato no inicializado", 'error');
      return;
    }
    
    if (!cedulaPropietario || !descripcionPropiedad) {
      showNotification("Cédula y descripción son requeridos", 'error');
      return;
    }

    try {
      // Verificar que la persona existe
      if (personasContract) {
        try {
          await personasContract.methods.obtenerIdPorCi(cedulaPropietario).call();
        } catch {
          showNotification("La cédula no está registrada en el sistema de Personas", 'error');
          return;
        }
      }

      await herenciaContract.methods
        .registrarPropiedad(cedulaPropietario, descripcionPropiedad)
        .send({ from: account });

      showNotification("Propiedad registrada exitosamente", 'success');
      
      // Limpiar campos
      setCedulaPropietario("");
      setDescripcionPropiedad("");
      
    } catch (err) {
      console.error(err);
      if (err.message.includes("Solo el dueño puede registrar su propiedad")) {
        showNotification("Solo el dueño puede registrar propiedades a su nombre", 'error');
      } else {
        showNotification("Error al registrar propiedad", 'error');
      }
    }
  };

  // 2. CONSULTAR PROPIEDAD PARA HERENCIA
  const consultarPropiedadParaHerencia = async () => {
    if (!herenciaContract || !idPropiedadHerencia) {
      showNotification("Ingresa un ID de propiedad", 'error');
      return;
    }

    try {
      const propiedad = await herenciaContract.methods
        .obtenerPropiedad(idPropiedadHerencia)
        .call();
      
      if (propiedad && propiedad.idPropiedad !== "0") {
        setPropiedadInfo(propiedad);
        showNotification("Propiedad encontrada", 'success');
        
        // También consultar si ya tiene herencia definida
        const herencia = await herenciaContract.methods
          .obtenerHerencia(idPropiedadHerencia)
          .call();
        setHerenciaDefinida(herencia);
      } else {
        setPropiedadInfo(null);
        showNotification("Propiedad no encontrada", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification("Error al consultar propiedad", 'error');
    }
  };

  // 3. DEFINIR HERENCIA
  const definirHerencia = async () => {
    if (!herenciaContract || !idPropiedadHerencia || !propiedadInfo) {
      showNotification("Consulta primero una propiedad válida", 'error');
      return;
    }

    if (!herederosInput || !porcentajesInput) {
      showNotification("Ingresa herederos y porcentajes", 'error');
      return;
    }

    try {
      // Parsear herederos y porcentajes
      const herederos = herederosInput.split(",").map(h => h.trim());
      const porcentajes = porcentajesInput.split(",").map(p => parseInt(p.trim()));
      
      if (herederos.length !== porcentajes.length) {
        showNotification("El número de herederos debe coincidir con el número de porcentajes", 'error');
        return;
      }

      // Verificar que todos los herederos existan
      if (personasContract) {
        for (const ci of herederos) {
          try {
            await personasContract.methods.obtenerIdPorCi(ci).call();
          } catch {
            showNotification(`La cédula ${ci} no está registrada en el sistema`, 'error');
            return;
          }
        }
      }

      await herenciaContract.methods
        .definirHerencia(idPropiedadHerencia, herederos, porcentajes)
        .send({ from: account });

      showNotification("Herencia definida exitosamente", 'success');
      
      // Actualizar información
      consultarPropiedadParaHerencia();
      setHerederosInput("");
      setPorcentajesInput("");
      
    } catch (err) {
      console.error(err);
      if (err.message.includes("Solo el dueno actual")) {
        showNotification("Solo el dueño puede definir la herencia", 'error');
      } else if (err.message.includes("suma de porcentajes")) {
        showNotification("La suma de porcentajes debe ser 100", 'error');
      } else {
        showNotification("Error al definir herencia", 'error');
      }
    }
  };

  // 4. EJECUTAR HERENCIA
  const ejecutarHerencia = async () => {
    if (!herenciaContract || !idPropiedadEjecutar) {
      showNotification("Ingresa un ID de propiedad", 'error');
      return;
    }

    try {
      // Primero verificar si la propiedad existe y tiene herencia definida
      const propiedad = await herenciaContract.methods
        .obtenerPropiedad(idPropiedadEjecutar)
        .call();
      
      if (!propiedad || propiedad.idPropiedad === "0") {
        showNotification("Propiedad no encontrada", 'error');
        return;
      }

      if (!propiedad.enHerencia) {
        showNotification("La propiedad no tiene herencia definida", 'error');
        return;
      }

      await herenciaContract.methods
        .ejecutarHerencia(idPropiedadEjecutar)
        .send({ from: account });

      showNotification("Herencia ejecutada exitosamente", 'success');
      setIdPropiedadEjecutar("");
      
    } catch (err) {
      console.error(err);
      if (err.message.includes("No autorizado")) {
        showNotification("No estás autorizado para ejecutar esta herencia", 'error');
      } else if (err.message.includes("Herencia ya ejecutada")) {
        showNotification("Esta herencia ya fue ejecutada anteriormente", 'error');
      } else {
        showNotification("Error al ejecutar herencia", 'error');
      }
    }
  };

  // 5. CONSULTAR PROPIEDAD Y HERENCIA
  const consultarPropiedad = async () => {
    if (!herenciaContract || !idPropiedadConsultar) {
      showNotification("Ingresa un ID de propiedad", 'error');
      return;
    }

    try {
      const propiedad = await herenciaContract.methods
        .obtenerPropiedad(idPropiedadConsultar)
        .call();
      
      if (propiedad && propiedad.idPropiedad !== "0") {
        setPropiedadConsultada(propiedad);
        
        // Consultar herencia también
        const herencia = await herenciaContract.methods
          .obtenerHerencia(idPropiedadConsultar)
          .call();
        setHerenciaConsultada(herencia);
        
        showNotification("Propiedad encontrada", 'success');
      } else {
        setPropiedadConsultada(null);
        setHerenciaConsultada([]);
        showNotification("Propiedad no encontrada", 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification("Error al consultar propiedad", 'error');
    }
  };

  // 6. BUSCAR PROPIEDADES POR CÉDULA (simulado)
  const buscarPropiedadesPorCedula = async () => {
    if (!cedulaConsultaPropiedades) {
      showNotification("Ingresa una cédula", 'error');
      return;
    }

    // Nota: Necesitarías una función en el contrato para listar propiedades por cédula
    // Esta es una implementación básica - necesitarías modificar el contrato para mejorarlo
    showNotification("Función de búsqueda por cédula requiere implementación adicional en el contrato", 'info');
  };

  // Función para limpiar campos de herencia
  const limpiarCamposHerencia = () => {
    setIdPropiedadHerencia("");
    setPropiedadInfo(null);
    setHerenciaDefinida([]);
    setHerederosInput("");
    setPorcentajesInput("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          🏛️ DApp de Gestión de Herencias y Propiedades
        </h1>
        
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ message: '', type: '' })} 
        />
        
        <div className="text-center mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg text-gray-700">
          <p>Cuenta conectada: <span className="font-mono font-semibold text-blue-800 break-all">{account || "No conectada"}</span></p>
          <p className="text-sm mt-1">Asegúrate de estar conectado con la wallet correcta para cada operación</p>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- COLUMNA IZQUIERDA: REGISTRO Y GESTIÓN --- */}
          <div className="space-y-8">
            
            {/* 1. REGISTRAR PROPIEDAD */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>1. Registrar Nueva Propiedad</h2>
              <p className="text-sm text-gray-600 mb-4">Registra una propiedad a tu nombre. Debes ser el dueño registrado en el sistema de Personas.</p>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Tu Cédula (como propietario)" 
                  value={cedulaPropietario} 
                  onChange={(e) => setCedulaPropietario(e.target.value)} 
                  className={inputClasses}
                />
                <textarea 
                  placeholder="Descripción de la propiedad (dirección, características, etc.)" 
                  value={descripcionPropiedad} 
                  onChange={(e) => setDescripcionPropiedad(e.target.value)} 
                  className={inputClasses}
                  rows="3"
                />
                
                <button 
                  onClick={registrarPropiedad} 
                  className={primaryButtonClasses}
                  disabled={!herenciaContract}
                >
                  Registrar Propiedad
                </button>
              </div>
            </div>

            {/* 2. DEFINIR HERENCIA */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>2. Definir Herencia para Propiedad</h2>
              <p className="text-sm text-gray-600 mb-4">Define los herederos y porcentajes para una propiedad que ya te pertenece.</p>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    placeholder="ID de Propiedad" 
                    value={idPropiedadHerencia} 
                    onChange={(e) => setIdPropiedadHerencia(e.target.value)} 
                    className={inputClasses}
                  />
                  <button 
                    onClick={consultarPropiedadParaHerencia} 
                    className={secondaryButtonClasses}
                    disabled={!herenciaContract}
                  >
                    Consultar
                  </button>
                </div>

                {propiedadInfo && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-800">Propiedad Encontrada:</h3>
                    <p><strong>ID:</strong> {propiedadInfo.idPropiedad}</p>
                    <p><strong>Descripción:</strong> {propiedadInfo.descripcion}</p>
                    <p><strong>Dueño:</strong> {propiedadInfo.ciDueno}</p>
                    <p><strong>Estado:</strong> {propiedadInfo.enHerencia ? "✅ Herencia definida" : "❌ Sin herencia"}</p>
                  </div>
                )}

                {propiedadInfo && (
                  <>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Herederos (separados por coma):
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej: 12345678, 87654321, 55555555" 
                        value={herederosInput} 
                        onChange={(e) => setHerederosInput(e.target.value)} 
                        className={inputClasses}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Porcentajes (separados por coma, suma=100):
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej: 50, 30, 20" 
                        value={porcentajesInput} 
                        onChange={(e) => setPorcentajesInput(e.target.value)} 
                        className={inputClasses}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={definirHerencia} 
                        className={primaryButtonClasses}
                        disabled={!herederosInput || !porcentajesInput}
                      >
                        Definir Herencia
                      </button>
                      <button 
                        onClick={limpiarCamposHerencia} 
                        className={secondaryButtonClasses}
                      >
                        Limpiar
                      </button>
                    </div>

                    {herenciaDefinida.length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-bold text-yellow-800 mb-2">Herencia Actualmente Definida:</h4>
                        <ul className="space-y-2">
                          {herenciaDefinida.map((h, idx) => (
                            <li key={idx} className="text-sm">
                              {h.ciHeredero}: {h.porcentaje}%
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 3. EJECUTAR HERENCIA */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>3. Ejecutar Herencia</h2>
              <p className="text-sm text-gray-600 mb-4">Ejecuta la transferencia de propiedad según la herencia definida.</p>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    placeholder="ID de Propiedad a transferir" 
                    value={idPropiedadEjecutar} 
                    onChange={(e) => setIdPropiedadEjecutar(e.target.value)} 
                    className={inputClasses}
                  />
                  <button 
                    onClick={ejecutarHerencia} 
                    className={dangerButtonClasses}
                    disabled={!idPropiedadEjecutar}
                  >
                    Ejecutar Herencia
                  </button>
                </div>
                <p className="text-sm text-red-600">
                  ⚠️ Nota: Esta acción transferirá la propiedad a los herederos definidos.
                </p>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA: CONSULTAS --- */}
          <div className="space-y-8">
            
            {/* 4. CONSULTAR PROPIEDAD */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>4. Consultar Propiedad</h2>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    placeholder="ID de Propiedad" 
                    value={idPropiedadConsultar} 
                    onChange={(e) => setIdPropiedadConsultar(e.target.value)} 
                    className={inputClasses}
                  />
                  <button 
                    onClick={consultarPropiedad} 
                    className={secondaryButtonClasses}
                    disabled={!herenciaContract}
                  >
                    Consultar
                  </button>
                </div>

                {propiedadConsultada && (
                  <div className={resultCardClasses}>
                    <h3 className="text-lg font-bold mb-3 text-blue-800">📋 Información de la Propiedad</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p><strong>ID:</strong> {propiedadConsultada.idPropiedad}</p>
                        <p><strong>Dueño:</strong> {propiedadConsultada.ciDueno}</p>
                        <p><strong>Wallet Dueño:</strong> <span className="text-xs font-mono break-all">{propiedadConsultada.walletDueno}</span></p>
                      </div>
                      <div>
                        <p><strong>Estado Herencia:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${propiedadConsultada.enHerencia ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {propiedadConsultada.enHerencia ? 'DEFINIDA' : 'NO DEFINIDA'}
                          </span>
                        </p>
                        <p><strong>Transferida:</strong> 
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${propiedadConsultada.heredada ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {propiedadConsultada.heredada ? 'TRANSFERIDA' : 'ACTIVA'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p><strong>Descripción:</strong></p>
                      <p className="text-gray-700">{propiedadConsultada.descripcion}</p>
                    </div>

                    {herenciaConsultada.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-bold text-purple-700 mb-2">🏛️ Distribución de Herencia:</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Heredero</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Wallet</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Porcentaje</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {herenciaConsultada.map((h, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2 text-sm">{h.ciHeredero}</td>
                                  <td className="px-3 py-2 text-xs font-mono break-all">{h.walletHeredero}</td>
                                  <td className="px-3 py-2 text-sm font-bold text-blue-600">{h.porcentaje}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 5. BUSCAR PROPIEDADES POR PERSONA */}
            <div className={containerClasses}>
              <h2 className={sectionTitleClasses}>5. Buscar Propiedades por Cédula</h2>
              <p className="text-sm text-gray-600 mb-4">Busca propiedades asociadas a una cédula específica.</p>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Cédula del propietario" 
                    value={cedulaConsultaPropiedades} 
                    onChange={(e) => setCedulaConsultaPropiedades(e.target.value)} 
                    className={inputClasses}
                  />
                  <button 
                    onClick={buscarPropiedadesPorCedula} 
                    className={secondaryButtonClasses}
                  >
                    Buscar
                  </button>
                </div>

                {propiedadesPersona.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="font-bold text-gray-800 mb-2">Propiedades encontradas:</h4>
                    <div className="space-y-3">
                      {propiedadesPersona.map((prop, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                          <p><strong>ID:</strong> {prop.idPropiedad}</p>
                          <p><strong>Descripción:</strong> {prop.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : propiedadesPersona.length === 0 && cedulaConsultaPropiedades ? (
                  <p className="text-gray-500 text-sm">No se encontraron propiedades para esta cédula</p>
                ) : null}
              </div>
            </div>

            {/* 6. INFORMACIÓN DEL SISTEMA */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h2 className="text-lg font-bold text-blue-800 mb-3">ℹ️ Información del Sistema</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ <strong>Registro de Propiedades:</strong> Solo el dueño puede registrar propiedades a su nombre</li>
                <li>✅ <strong>Definir Herencia:</strong> Requiere ser dueño de la propiedad</li>
                <li>✅ <strong>Ejecutar Herencia:</strong> Solo el dueño puede ejecutar la herencia</li>
                <li>⚠️ <strong>Validaciones:</strong> Todas las cédulas deben estar registradas en el sistema Personas</li>
                <li>⚠️ <strong>Suma de Porcentajes:</strong> Debe ser exactamente 100%</li>
                <li>📊 <strong>Herencia:</strong> Puedes definir múltiples herederos con diferentes porcentajes</li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">📝 Notas Importantes:</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Las propiedades solo pueden ser registradas por su dueño legítimo</li>
                  <li>• La herencia puede ser modificada mientras no se ejecute</li>
                  <li>• Una vez ejecutada la herencia, la propiedad se marca como transferida</li>
                  <li>• Todos los herederos deben estar registrados en el sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerenciaComponent;