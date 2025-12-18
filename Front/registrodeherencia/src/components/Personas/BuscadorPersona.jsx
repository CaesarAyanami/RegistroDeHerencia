import React, { useState, useCallback, useMemo, memo } from "react";

const BuscadorPersonas = memo(({ contract, onEdit, showNotification }) => {
  const [criterio, setCriterio] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState("id");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const getGeneroText = useCallback((value) => {
    const gen = Number(value);
    const opciones = { 0: "Masculino", 1: "Femenino" };
    return opciones[gen] || "Otro";
  }, []);

  const formatFecha = useCallback((timestamp) => {
    const t = Number(timestamp);
    if (!t || t === 0) return "No registrada";
    try {
      return new Date(t * 1000).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return "Fecha inválida";
    }
  }, []);

  const ejecutarBusqueda = async () => {
    if (!contract) {
      return showNotification("Contrato no cargado", "error");
    }
    
    const valorBusqueda = criterio.trim();
    if (!valorBusqueda) {
      return showNotification("Por favor, ingrese un valor para buscar", "warning");
    }

    setLoading(true);
    setResultado(null);

    try {
      let res;
      if (tipoBusqueda === "id") {
        res = await contract.methods.obtenerPersonaPorId(valorBusqueda).call();
      } else {
        res = await contract.methods.obtenerPersonaPorCI(valorBusqueda).call();
      }

      if (res && res.nombres && res.nombres.trim() !== "") {
        setResultado(res);
        showNotification("Ciudadano localizado en la red", "success");
      } else {
        showNotification("No se encontró ningún registro coincidente", "info");
      }
    } catch (err) {
      console.error("Search Error:", err);
      showNotification("Error de comunicación con el nodo Blockchain", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 transition-colors duration-300">
      {/* Selector de tipo de búsqueda */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {["id", "cedula"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => { setTipoBusqueda(tipo); setResultado(null); }}
            className={`flex-1 py-2 md:py-2.5 text-xs font-bold rounded-md transition-all duration-300 uppercase tracking-wider ${
              tipoBusqueda === tipo 
                ? "bg-white dark:bg-gray-800 shadow-sm text-emerald-600 dark:text-emerald-400" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tipo === "id" ? "Buscar por ID" : "Buscar por Cédula"}
          </button>
        ))}
      </div>

      {/* Input de búsqueda */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
          {tipoBusqueda === "id" ? "ID del Registro" : "Documento de Identidad"}
        </label>
        <input
          type="text"
          placeholder={tipoBusqueda === "id" ? "Ej: 10" : "Ej: 29664154"}
          className="w-full px-3 py-2.5 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
          value={criterio}
          onChange={(e) => setCriterio(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ejecutarBusqueda()}
        />
      </div>

      {/* Botón de búsqueda */}
      <button
        onClick={ejecutarBusqueda}
        disabled={loading}
        className="w-full px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] md:text-xs">CONSULTANDO...</span>
          </>
        ) : (
          <span className="flex items-center gap-2">
            <span>🔍</span>
            EJECUTAR BÚSQUEDA
          </span>
        )}
      </button>

      {/* Resultados */}
      {resultado && (
        <div className="mt-4 md:mt-6 border border-emerald-100 dark:border-emerald-900/50 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
          {/* Header de resultados */}
          <div className="p-3 md:p-4 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded text-xs">
                📋
              </span>
              <h3 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Datos Completos
              </h3>
            </div>
            <button 
              onClick={() => onEdit(resultado)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors duration-300 flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>✏️</span>
              EDITAR REGISTRO
            </button>
          </div>
          
          {/* Contenido de resultados */}
          <div className="p-3 md:p-4 space-y-3 md:space-y-4">
            {/* Nombre y apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Nombres
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                  {resultado.nombres}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Apellidos
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                  {resultado.apellidos}
                </p>
              </div>
            </div>

            {/* Cédula y género */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Cédula
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {resultado.cedula}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Género
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {getGeneroText(resultado.genero)}
                </p>
              </div>
            </div>

            {/* Fecha nacimiento y estado civil */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Fecha de Nacimiento
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {formatFecha(resultado.fechaNacimiento)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Estado Civil
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {resultado.estadoCivil || "No especificado"}
                </p>
              </div>
            </div>

            {/* Dirección */}
            <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Dirección de Habitación
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight break-words">
                {resultado.direccion || "Sin dirección"}
              </p>
            </div>

            {/* Wallet address */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Dirección Wallet (Blockchain)
              </p>
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 break-all bg-gray-100 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                {resultado.wallet}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default BuscadorPersonas;