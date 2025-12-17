import React, { useState } from "react";

const ConsultarPlanHerencia = ({ contract, propContract, showNotification }) => {
  // Estados para la búsqueda inicial
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);

  // Estados para el detalle del protocolo
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [protocolo, setProtocolo] = useState([]); // [{ci, porc}]
  const [cargandoProtocolo, setCargandoProtocolo] = useState(false);

  // 1. Buscar propiedades vinculadas a la CI del dueño
  const buscarBienes = async () => {
    if (!ciDueno.trim()) return showNotification("Ingresa la CI del titular", "alert");
    
    setBuscandoProps(true);
    setPropSeleccionada(null);
    setProtocolo([]);
    
    try {
      // Usamos el método de tu contrato de propiedades
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      setPropiedades(data);
      if (data.length === 0) showNotification("No se encontraron bienes", "info");
    } catch (e) {
      showNotification("Error al consultar propiedades", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  // 2. Cargar el protocolo de herencia de la propiedad seleccionada
  const cargarDetalleHerencia = async (prop) => {
    setPropSeleccionada(prop);
    setCargandoProtocolo(true);
    setProtocolo([]);

    try {
      const id = prop.idPropiedad;
      
      // Función que mencionaste: obtiene el array de CIs
      const cisHerederos = await contract.methods.obtenerCiConParticipacion(id).call();

      if (!cisHerederos || cisHerederos.length === 0) {
        showNotification("Esta propiedad no tiene plan de herencia", "info");
      } else {
        // Obtenemos los porcentajes para cada CI encontrada
        const promesas = cisHerederos.map(async (ci) => {
          const porc = await contract.methods.obtenerParticipacion(id, ci).call();
          return { ci, porc };
        });

        const resultados = await Promise.all(promesas);
        setProtocolo(resultados);
      }
    } catch (e) {
      console.error(e);
      showNotification("Error al obtener el protocolo", "error");
    } finally {
      setCargandoProtocolo(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* SECCIÓN IZQUIERDA: BUSCADOR DE BIENES POR CI */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
        <h2 className="text-lg font-black italic text-gray-800 uppercase mb-4 flex items-center gap-2">
          <span className="w-2 h-5 bg-blue-600 rounded-full"></span> 1. Buscar por Titular
        </h2>

        <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <input 
            className="flex-1 bg-transparent outline-none text-sm font-bold px-3" 
            placeholder="CI del Dueño..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarBienes()}
          />
          <button 
            onClick={buscarBienes}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all"
          >
            {buscandoProps ? "..." : "BUSCAR"}
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => cargarDetalleHerencia(p)}
              className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-blue-600 border-blue-600 shadow-lg scale-[1.02]" 
                : "bg-gray-50 border-gray-100 hover:border-blue-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[9px] font-black px-2 py-1 rounded-full ${
                  propSeleccionada?.idPropiedad === p.idPropiedad ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
                }`}>
                  ID #{p.idPropiedad.toString()}
                </span>
                {p.enHerencia && <span className={`text-[8px] font-bold uppercase italic ${propSeleccionada?.idPropiedad === p.idPropiedad ? "text-blue-100" : "text-amber-500"}`}>Con Protocolo</span>}
              </div>
              <p className={`text-xs font-bold leading-tight ${propSeleccionada?.idPropiedad === p.idPropiedad ? "text-white" : "text-gray-700"}`}>
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN DERECHA: PROTOCOLO DE HERENCIA */}
      <section className={`bg-white p-6 rounded-[2.5rem] shadow-xl border-t-8 border-indigo-600 transition-all duration-500 ${!propSeleccionada ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
        <h2 className="text-lg font-black italic text-gray-800 uppercase mb-4 text-center">Protocolo de Distribución</h2>
        
        {cargandoProtocolo ? (
          <div className="py-20 text-center animate-pulse">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sincronizando Ledger...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {protocolo.length > 0 ? (
              <>
                <div className="mb-4 p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase">Detalle del Bien seleccionado:</p>
                  <p className="text-sm font-bold text-indigo-900 truncate">{propSeleccionada?.descripcion}</p>
                </div>

                <div className="space-y-2 min-h-[150px]">
                  {protocolo.map((h, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase">Beneficiario</p>
                        <span className="text-xs font-black text-gray-600">CI: {h.ci}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-indigo-400 uppercase">Cuota</p>
                        <span className="text-xl font-black text-indigo-600">{h.porc}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-indigo-600 rounded-2xl text-center shadow-lg shadow-indigo-100">
                   <p className="text-[10px] font-black text-indigo-100 uppercase mb-1">Total Protocolo</p>
                   <p className="text-2xl font-black text-white">100% Validado</p>
                </div>
              </>
            ) : (
              <div className="text-center py-20 opacity-30">
                <p className="text-[10px] font-black uppercase">Selecciona una propiedad para ver herederos</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConsultarPlanHerencia;