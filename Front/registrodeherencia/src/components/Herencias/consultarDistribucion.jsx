import React, { useState } from "react";

const ConsultarPlanHerencia = ({ contract, propContract, showNotification }) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [protocolo, setProtocolo] = useState([]);
  const [cargandoProtocolo, setCargandoProtocolo] = useState(false);

  const buscarBienes = async () => {
    if (!ciDueno.trim()) return showNotification("Ingresa la CI del titular", "alert");
    setBuscandoProps(true);
    setPropSeleccionada(null);
    setProtocolo([]);

    try {
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      setPropiedades(data);
      if (data.length === 0) showNotification("No se encontraron bienes", "info");
    } catch (e) {
      showNotification("Error al consultar propiedades", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const cargarDetalleHerencia = async (prop) => {
    setPropSeleccionada(prop);
    setCargandoProtocolo(true);
    setProtocolo([]);

    try {
      const id = prop.idPropiedad;
      const cisHerederos = await contract.methods.obtenerCiConParticipacion(id).call();

      if (!cisHerederos || cisHerederos.length === 0) {
        showNotification("Esta propiedad no tiene plan de herencia", "info");
      } else {
        const promesas = cisHerederos.map(async (ci) => {
          const porc = await contract.methods.obtenerParticipacion(id, ci).call();
          return { ci, porc };
        });
        const resultados = await Promise.all(promesas);
        setProtocolo(resultados);
      }
    } catch (e) {
      showNotification("Error al obtener el protocolo", "error");
    } finally {
      setCargandoProtocolo(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
      
      {/* CABECERA ESTILO AUDITORÍA */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/30 dark:bg-indigo-900/20 flex items-center gap-2">
        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md text-xs">
          📊
        </div>
        <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Distribución de Herencia
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* BUSCADOR SUPERIOR */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="CI del Titular..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarBienes()}
          />
          <button 
            onClick={buscarBienes}
            disabled={buscandoProps}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            {buscandoProps ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px]">BUSCANDO...</span>
              </div>
            ) : "BUSCAR"}
          </button>
        </div>

        {/* LISTADO DE BIENES (VERTICAL CON SCROLL) */}
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div 
              key={idx} 
              onClick={() => cargarDetalleHerencia(p)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all duration-300 ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-400 text-white shadow-md" 
                : "bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded ${
                  propSeleccionada?.idPropiedad === p.idPropiedad 
                    ? "bg-indigo-500 dark:bg-indigo-400" 
                    : "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900"
                }`}>
                  ID #{p.idPropiedad.toString()}
                </span>
                {p.enHerencia && (
                  <span className="text-[7px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter">
                    ● Protocolizado
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold truncate mt-1 uppercase text-gray-800 dark:text-gray-200">
                {p.descripcion}
              </p>
            </div>
          ))}
          {!buscandoProps && propiedades.length === 0 && (
            <div className="text-center py-4 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase">
                  Sin resultados
                </p>
            </div>
          )}
        </div>

        {/* PROTOCOLO RESULTANTE (PARTE INFERIOR) */}
        <div className={`pt-4 border-t border-gray-100 dark:border-gray-700 transition-all duration-500 ${!propSeleccionada ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            Protocolo de Distribución
          </h3>
          
          {cargandoProtocolo ? (
            <div className="flex flex-col items-center py-6 animate-pulse">
              <div className="w-5 h-5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase">
                Sincronizando Ledger...
              </p>
            </div>
          ) : protocolo.length > 0 ? (
            <div className="space-y-2">
              {/* Activo seleccionado destacado */}
              <div className="p-2.5 bg-gray-900 dark:bg-gray-700 rounded-lg mb-3 shadow-lg">
                <p className="text-[7px] font-bold text-indigo-400 uppercase tracking-wider">
                  Activo Seleccionado
                </p>
                <p className="text-[10px] font-bold text-white dark:text-gray-200 truncate uppercase">
                  {propSeleccionada?.descripcion}
                </p>
              </div>

              {/* Lista de herederos */}
              <div className="space-y-1.5">
                {protocolo.map((h, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                    <div>
                      <p className="text-[7px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                        Beneficiario
                      </p>
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 font-mono">
                        CI: {h.ci}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] font-bold text-indigo-400 uppercase leading-none">
                        Cuota
                      </p>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {h.porc}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 opacity-40 dark:opacity-30">
              <span className="text-xl mb-1">📜</span>
              <p className="text-[8px] font-bold uppercase tracking-tighter text-gray-400 dark:text-gray-500">
                Seleccione un activo para auditar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultarPlanHerencia;