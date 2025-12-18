import React, { useState } from "react";

const VisorPropiedades = ({ contract, showNotification }) => {
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [lista, setLista] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const handleInputChange = (e) => {
    const nuevoValor = e.target.value;
    setCiBusqueda(nuevoValor);
    if (lista.length > 0) setLista([]);
  };

  const consultar = async () => {
    const inputLimpio = ciBusqueda.trim();
    if (!inputLimpio) return showNotification("Ingresa una CI para buscar", "alert");
    
    setBuscando(true);
    setLista([]);

    try {
      const data = await contract.methods.listarPropiedadesPorCI(inputLimpio).call();
      setLista(data);
      if(data.length === 0) showNotification("No se encontraron registros", "info");
    } catch (e) {
      console.error(e);
      showNotification("Error al consultar lista", "error");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6 transition-colors duration-300">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <span className="w-1 h-6 bg-emerald-600 rounded-full hidden sm:block"></span>
          <h2 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">
            Consulta de Propiedades
          </h2>
        </div>
        {lista.length > 0 && (
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg uppercase tracking-wider">
            {lista.length} registro{lista.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
        <div className="flex-1">
          <input 
            className="w-full px-3 py-2.5 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Cédula del titular (Ej: 12345678)"
            value={ciBusqueda}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && consultar()}
          />
        </div>
        <button 
          onClick={consultar}
          disabled={buscando}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
        >
          {buscando ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>CONSULTANDO...</span>
            </div>
          ) : "CONSULTAR"}
        </button>
      </div>

      {/* Contenedor de Resultados */}
      <div className="flex-1 space-y-3 md:space-y-4 overflow-y-auto pr-1 md:pr-2 max-h-[500px] md:max-h-[600px] scrollbar-thin">
        {buscando && (
          <div className="py-12 md:py-20 flex flex-col items-center justify-center animate-pulse">
            <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-emerald-100 dark:border-emerald-900 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin mb-3 md:mb-4"></div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Consultando Ledger...
            </p>
          </div>
        )}

        {!buscando && lista.map((p, idx) => {
          const esPropiedadActual = p.ciDueno.toString() === ciBusqueda.trim();

          return (
            <div 
              key={idx} 
              className={`p-4 md:p-5 rounded-xl border transition-all duration-300 ${
                esPropiedadActual 
                ? "bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800 shadow-sm ring-1 ring-emerald-500/10 dark:ring-emerald-400/10" 
                : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-90"
              }`}
            >
              {/* Encabezado de la propiedad */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3 md:mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    esPropiedadActual 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    ID #{p.idPropiedad.toString()}
                  </span>
                  {!esPropiedadActual && (
                    <span className="bg-gray-500 dark:bg-gray-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Historial
                    </span>
                  )}
                  {p.enHerencia && (
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                      ⚖️ En Sucesión
                    </span>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <p className={`text-sm mb-4 leading-relaxed ${
                esPropiedadActual 
                  ? "text-gray-800 dark:text-gray-200 font-medium" 
                  : "text-gray-500 dark:text-gray-400 italic"
              }`}>
                {p.descripcion}
              </p>

              {/* Detalles de titular */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Titular Actual
                  </span>
                  <span className={`text-xs font-bold ${
                    esPropiedadActual 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-gray-600 dark:text-gray-400"
                  }`}>
                    CI: {p.ciDueno}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Wallet vinculada
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 truncate block">
                    {p.walletDueno}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {!buscando && lista.length === 0 && (
          <div className="text-center py-12 md:py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <div className="text-3xl md:text-4xl mb-3 opacity-20 dark:opacity-30">🏢</div>
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
              {ciBusqueda 
                ? "Sin registros para esta cédula" 
                : "Ingrese una cédula para consultar títulos"}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
              {ciBusqueda 
                ? "Verifique que la cédula esté correctamente escrita"
                : "La búsqueda mostrará todos los títulos vinculados a la cédula"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisorPropiedades;