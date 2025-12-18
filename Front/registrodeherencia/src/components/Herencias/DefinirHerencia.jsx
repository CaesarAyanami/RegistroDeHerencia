import React, { useState } from "react";

const DefinirHerencia = ({ contract, propContract, onPrepare, showNotification }) => {
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [listaPropiedades, setListaPropiedades] = useState([]);
  const [buscando, setBuscando] = useState(false);
  
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
  const [herederos, setHerederos] = useState([]); 
  const [tempCi, setTempCi] = useState("");
  const [tempPorc, setTempPorc] = useState("");

  const consultarBienes = async () => {
    if (!ciBusqueda.trim()) return showNotification("Ingresa la CI del titular", "alert");
    setBuscando(true);
    setPropiedadSeleccionada(null);
    try {
      const data = await propContract.methods.listarPropiedadesPorCI(ciBusqueda.trim()).call();
      setListaPropiedades(data);
      if (data.length === 0) showNotification("No se encontraron bienes para esta CI", "info");
    } catch (e) {
      showNotification("Error al consultar el registro de propiedades", "error");
    } finally {
      setBuscando(false);
    }
  };

  const agregarHeredero = () => {
    if (!tempCi.trim() || !tempPorc) return showNotification("Completa los datos del heredero", "alert");
    const porcNum = parseInt(tempPorc);
    if (isNaN(porcNum) || porcNum <= 0) return showNotification("Porcentaje inválido", "alert");
    
    const totalActual = herederos.reduce((acc, curr) => acc + curr.porc, 0);
    if (totalActual + porcNum > 100) return showNotification("La suma supera el 100%", "error");
    
    setHerederos([...herederos, { ci: tempCi.trim(), porc: porcNum }]);
    setTempCi("");
    setTempPorc("");
  };

  const eliminarHeredero = (index) => {
    const nuevos = herederos.filter((_, i) => i !== index);
    setHerederos(nuevos);
  };

  const prepararTransaccion = () => {
    const total = herederos.reduce((acc, curr) => acc + curr.porc, 0);
    if (total !== 100) return showNotification("La suma debe ser exactamente 100%", "error");
    if (!propiedadSeleccionada) return showNotification("Selecciona una propiedad", "error");

    const cis = herederos.map(h => h.ci);
    const porcs = herederos.map(h => h.porc);

    try {
      const metodo = contract.methods.definirHerencia(
        propiedadSeleccionada.idPropiedad, 
        ciBusqueda.trim(), 
        cis, 
        porcs
      );
      onPrepare(metodo);
    } catch (err) {
      showNotification("Error al construir la transacción", "error");
    }
  };

  const totalPorc = herederos.reduce((acc, curr) => acc + curr.porc, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
      
      {/* COLUMNA 1: SELECCIÓN DE ACTIVO */}
      <div className="p-3 md:p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md flex items-center justify-center font-bold text-xs md:text-sm border border-indigo-100 dark:border-indigo-800">
            1
          </div>
          <h3 className="text-base md:text-lg font-black text-gray-800 dark:text-gray-200 tracking-tight">
            Seleccionar Activo
          </h3>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4 md:mb-6">
          <input 
            className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="CI del Titular..."
            value={ciBusqueda}
            onChange={(e) => setCiBusqueda(e.target.value)}
          />
          <button 
            onClick={consultarBienes}
            disabled={buscando}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            {buscando ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px]">BUSCANDO...</span>
              </div>
            ) : "BUSCAR"}
          </button>
        </div>

        {/* Lista de propiedades */}
        <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {listaPropiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setPropiedadSeleccionada(p);
                setHerederos([]);
              }}
              className={`p-3 md:p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                propiedadSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-400/20" 
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                  ID #{p.idPropiedad.toString()}
                </span>
                {p.enHerencia && (
                  <span className="text-[9px] bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 px-2 py-1 rounded font-bold uppercase tracking-wider">
                    Plan Activo
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-2">
                {p.descripcion}
              </p>
            </div>
          ))}
          {listaPropiedades.length === 0 && !buscando && (
            <div className="text-center py-8 opacity-40 text-sm italic text-gray-500 dark:text-gray-400">
              Sin bienes cargados
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA 2: CONFIGURACIÓN DE HEREDEROS */}
      <div className={`p-3 md:p-4 lg:p-6 bg-gray-50/50 dark:bg-gray-800/50 transition-all duration-500 ${!propiedadSeleccionada ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md flex items-center justify-center font-bold text-xs md:text-sm shadow-sm">
            2
          </div>
          <h3 className="text-base md:text-lg font-black text-gray-800 dark:text-gray-200 tracking-tight">
            Distribución de Herencia
          </h3>
        </div>

        <div className="space-y-3 md:space-y-4">
          {/* Formulario para agregar herederos */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Heredero (CI)
              </label>
              <input 
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Ej: 20444555"
                value={tempCi} 
                onChange={e => setTempCi(e.target.value)}
              />
            </div>
            <div className="w-20 space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                %
              </label>
              <input 
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-300 dark:text-gray-200 text-center"
                type="number"
                value={tempPorc} 
                onChange={e => setTempPorc(e.target.value)}
              />
            </div>
            <button 
              onClick={agregarHeredero}
              className="self-end p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm"
            >
              <span className="text-xl leading-none">+</span>
            </button>
          </div>

          {/* Lista de herederos */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-inner">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {herederos.map((h, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block uppercase tracking-wide">
                      Heredero
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      CI: {h.ci}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {h.porc}%
                    </span>
                    <button 
                      onClick={() => eliminarHeredero(i)}
                      className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <span className="text-lg">×</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Distribución:
            </span>
            <span className={`text-base md:text-lg font-bold ${
              totalPorc === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
            }`}>
              {totalPorc}%
            </span>
          </div>

          {/* Botón de acción */}
          <button 
            onClick={prepararTransaccion}
            disabled={totalPorc !== 100}
            className={`w-full px-3 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-sm ${
              totalPorc === 100 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            NOTARIAR SUCESIÓN
          </button>

          {/* Información adicional */}
          <div className="pt-1">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center italic">
              La suma de porcentajes debe ser exactamente 100%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefinirHerencia;