import React, { useState } from "react";

const EjecutarHerencia = ({ contract, propContract, onPrepare, showNotification }) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [ciHeredero, setCiHeredero] = useState("");

  const buscarBienes = async () => {
    if (!propContract) return showNotification("Contrato Propiedades no detectado", "error");
    if (!ciDueno.trim()) return showNotification("Ingrese CI del titular fallecido", "alert");

    setBuscandoProps(true);
    setPropiedades([]);
    setPropSeleccionada(null);

    try {
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      if (!data || data.length === 0) {
        showNotification("Cédula sin activos registrados", "info");
      } else {
        setPropiedades(data);
        showNotification(`${data.length} activos localizados`, "success");
      }
    } catch (e) {
      showNotification("Error de conexión con la Blockchain", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const prepararTransaccion = async () => {
    if (!propSeleccionada) return showNotification("Seleccione un bien de la lista", "alert");
    if (!ciHeredero.trim()) return showNotification("Ingrese la CI del heredero", "alert");

    try {
      const id = propSeleccionada.idPropiedad;
      const plan = await contract.methods.obtenerHerencia(id).call();
      
      if (!plan || plan.length === 0) {
        return showNotification("Este bien no tiene un plan de herencia definido", "error");
      }

      const metodo = contract.methods.ejecutarHerencia(id, ciHeredero.trim());
      onPrepare(metodo);
      
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || "Error desconocido";
      showNotification(errorMsg.includes("revert") ? "La Blockchain rechazó la ejecución" : "Error de comunicación", "error");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 transition-colors duration-300">
      {/* Header del componente */}
      <div className="flex items-center gap-3 mb-2 md:mb-4">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center font-bold text-xs md:text-sm border border-emerald-100 dark:border-emerald-800">
          ⚖️
        </div>
        <h2 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">
          Adjudicación Legal
        </h2>
      </div>

      {/* PASO 1: Búsqueda de Bienes */}
      <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            1. Identificar Bienes del Causante
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Cédula del Titular..." 
              value={ciDueno} 
              onChange={(e) => setCiDueno(e.target.value)}
            />
            <button 
              onClick={buscarBienes}
              disabled={buscandoProps}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            >
              {buscandoProps ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[11px]">BUSCANDO...</span>
                </div>
              ) : "BUSCAR"}
            </button>
          </div>
        </div>
      </div>

      {/* LISTADO DE RESULTADOS */}
      {propiedades.length > 0 && (
        <div className="mb-4 md:mb-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            Seleccione el activo a traspasar
          </label>
          <div className="max-h-40 md:max-h-48 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {propiedades.map((p, idx) => (
              <div 
                key={idx}
                onClick={() => setPropSeleccionada(p)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  propSeleccionada?.idPropiedad === p.idPropiedad 
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-500/20 dark:ring-emerald-400/20" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    ID #{p.idPropiedad.toString()}
                  </span>
                  {p.enHerencia && (
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded font-bold uppercase tracking-wider">
                      CON PLAN
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                  {p.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASO 2: EJECUCIÓN */}
      <div className={`space-y-3 md:space-y-4 transition-all duration-500 ${!propSeleccionada ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            2. Cédula del Beneficiario
          </label>
          <input 
            className="w-full px-3 py-2 text-xs border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-900/20 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 text-emerald-700 dark:text-emerald-400 font-bold placeholder:text-emerald-400/50 dark:placeholder:text-emerald-600"
            placeholder="Ingrese Cédula del Heredero..." 
            value={ciHeredero} 
            onChange={(e) => setCiHeredero(e.target.value)}
          />
        </div>

        <button 
          onClick={prepararTransaccion}
          className="w-full px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-sm"
        >
          FIRMAR TRASPASO DE TÍTULO
        </button>

        {/* Información adicional */}
        <div className="pt-2">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center italic">
            Esta acción requiere firma digital para validar el cambio de titularidad
          </p>
        </div>
      </div>
    </div>
  );
};

export default EjecutarHerencia;