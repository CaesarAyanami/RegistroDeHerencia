import React, { useState } from "react";

const ConsultaPuntualParticipacion = ({ contract, propContract, showNotification }) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [ciHeredero, setCiHeredero] = useState("");
  const [resultado, setResultado] = useState(null);
  const [consultando, setConsultando] = useState(false);

  const buscarBienesDelDuenio = async () => {
    if (!ciDueno.trim()) return showNotification("Ingresa la CI del titular", "alert");
    setBuscandoProps(true);
    setPropSeleccionada(null);
    setResultado(null);
    try {
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      setPropiedades(data);
      if (data.length === 0) showNotification("No se encontraron bienes", "info");
    } catch (e) {
      showNotification("Error al consultar el registro", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const consultarCuotaEspecifica = async () => {
    if (!propSeleccionada) return showNotification("Selecciona una propiedad primero", "alert");
    if (!ciHeredero.trim()) return showNotification("Ingresa la CI del heredero", "alert");
    setConsultando(true);
    setResultado(null);
    try {
      const id = propSeleccionada.idPropiedad;
      const porcentaje = await contract.methods.obtenerParticipacion(parseInt(id), ciHeredero.trim()).call();
      setResultado({ porcentaje: porcentaje, ci: ciHeredero, id: id });
      
      if (parseInt(porcentaje) === 0) {
        showNotification("Sin asignación para este heredero", "info");
      } else {
        showNotification("Cuota verificada exitosamente", "success");
      }
    } catch (e) {
      showNotification("Error al verificar participación", "error");
    } finally {
      setConsultando(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
      
      {/* CABECERA */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/30 dark:bg-emerald-900/20 flex items-center gap-2">
        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-md text-xs">
          🔍
        </div>
        <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Consulta de Participación
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* BUSCADOR TITULAR */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Cédula del Dueño..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarBienesDelDuenio()}
          />
          <button 
            onClick={buscarBienesDelDuenio}
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

        {/* LISTADO DE BIENES (VERTICAL MINI) */}
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => { setPropSeleccionada(p); setResultado(null); }}
              className={`p-2 rounded-lg border cursor-pointer transition-all duration-300 ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-400 text-white shadow-sm" 
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-[8px] font-bold tracking-wider ${
                  propSeleccionada?.idPropiedad === p.idPropiedad 
                    ? "text-emerald-100" 
                    : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  ID #{p.idPropiedad.toString()}
                </span>
              </div>
              <p className="text-[10px] font-bold truncate uppercase text-gray-800 dark:text-gray-200">
                {p.descripcion}
              </p>
            </div>
          ))}
          {!buscandoProps && propiedades.length === 0 && (
            <div className="text-center py-4 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg opacity-40">
              <p className="text-[9px] font-bold uppercase tracking-tighter text-gray-400 dark:text-gray-500">
                Esperando búsqueda...
              </p>
            </div>
          )}
        </div>

        {/* FORMULARIO DE CONSULTA INDIVIDUAL */}
        <div className={`pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3 transition-all duration-500 ${!propSeleccionada ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">
              CI del Heredero a Verificar
            </label>
            <input 
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Ej: V-123456"
              value={ciHeredero}
              onChange={(e) => setCiHeredero(e.target.value)}
              disabled={!propSeleccionada}
            />
          </div>

          <button 
            onClick={consultarCuotaEspecifica}
            disabled={consultando || !propSeleccionada}
            className="w-full px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-sm"
          >
            {consultando ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px]">VERIFICANDO...</span>
              </div>
            ) : "CONSULTAR PARTICIPACIÓN"}
          </button>

          {/* RESULTADO FINAL ESTILO CERTIFICADO */}
          {resultado && (
            <div className="mt-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/50 rounded-lg p-4 shadow-sm relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 p-1 opacity-5 text-xl font-black italic select-none">VALIDADO</div>
                
                <p className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                  Cuota Registrada en Blockchain
                </p>
                
                <div className="inline-block relative mb-1">
                  <span className="text-4xl font-black text-gray-800 dark:text-gray-200 tracking-tighter">
                    {resultado.porcentaje}%
                  </span>
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Asignación Blockchain
                  </p>
                  <p className="text-[8px] text-gray-400 dark:text-gray-500 font-mono">
                    CI: {resultado.ci}
                  </p>
                  <p className="text-[8px] text-gray-400 dark:text-gray-500 font-mono">
                    ID Propiedad: {resultado.id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultaPuntualParticipacion;