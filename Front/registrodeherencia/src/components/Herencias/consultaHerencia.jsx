import React, { useState } from "react";

const VisualizadorPlanHerencia = ({ contract, propContract, showNotification }) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [planDistribucion, setPlanDistribucion] = useState([]);
  const [consultandoPlan, setConsultandoPlan] = useState(false);

  const buscarBienes = async () => {
    if (!ciDueno.trim()) return showNotification("Ingresa la CI del titular", "alert");
    setBuscandoProps(true);
    setPropSeleccionada(null);
    setPlanDistribucion([]);
    try {
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      setPropiedades(data);
      if (data.length === 0) showNotification("No hay bienes para esta cédula", "info");
    } catch (e) {
      showNotification("Error al acceder al registro de títulos", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const cargarPlanCompleto = async (propiedad) => {
    setPropSeleccionada(propiedad);
    setConsultandoPlan(true);
    setPlanDistribucion([]);
    try {
      const data = await contract.methods.obtenerHerencia(propiedad.idPropiedad).call();
      if (!data || data.length === 0) {
        showNotification("Este bien no tiene un plan de herencia registrado", "info");
      } else {
        setPlanDistribucion(data);
        showNotification("Plan de herencia cargado", "success");
      }
    } catch (e) {
      showNotification("Error al obtener datos del contrato", "error");
    } finally {
      setConsultandoPlan(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
      {/* CABECERA */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/30 dark:bg-emerald-900/20 flex items-center gap-2">
        <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-md text-xs">
          📂
        </span>
        <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Explorador de Títulos
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* BUSCADOR */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Cédula del Titular..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarBienes()}
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

        {/* LISTA DE BIENES (VERTICAL) */}
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => cargarPlanCompleto(p)}
              className={`p-2 rounded-lg border cursor-pointer transition-all duration-300 ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-500/20 dark:ring-emerald-400/20" 
                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-500"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  ID #{p.idPropiedad.toString()}
                </span>
              </div>
              <p className={`text-[11px] font-semibold truncate ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                  ? "text-emerald-900 dark:text-emerald-300" 
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                {p.descripcion}
              </p>
            </div>
          ))}
          {propiedades.length === 0 && !buscandoProps && (
            <p className="text-center py-4 text-[10px] text-gray-400 dark:text-gray-500 italic font-medium">
              Ingrese CI para listar bienes
            </p>
          )}
        </div>

        {/* DETALLE DEL PLAN (VERTICAL) */}
        <div className={`pt-4 border-t border-gray-100 dark:border-gray-700 transition-all duration-300 ${!propSeleccionada ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Plan de Adjudicación:
          </p>
          
          {consultandoPlan ? (
            <div className="flex flex-col items-center justify-center py-4 animate-pulse">
              <div className="w-6 h-6 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Cargando plan...
              </p>
            </div>
          ) : planDistribucion.length > 0 ? (
            <div className="space-y-2">
              {planDistribucion.map((dist, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      Heredero
                    </span>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 font-mono">
                      CI: {dist.ciHeredero}
                    </span>
                  </div>
                  <span className="text-lg font-black text-gray-900 dark:text-gray-200">
                    {dist.porcentaje.toString()}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-lg">
                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase italic">
                  Seleccione un título para ver el plan
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizadorPlanHerencia;