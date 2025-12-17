import React, { useState } from "react";

const VisualizadorPlanHerencia = ({ contract, propContract, showNotification }) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  
  const [planDistribucion, setPlanDistribucion] = useState([]);
  const [consultandoPlan, setConsultandoPlan] = useState(false);

  // 1. Buscar bienes vinculados al titular para elegir uno
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

  // 2. Consultar el array completo de herederos (Distribucion[])
  const cargarPlanCompleto = async (propiedad) => {
    setPropSeleccionada(propiedad);
    setConsultandoPlan(true);
    setPlanDistribucion([]);

    try {
      // Llamada a obtenerHerencia(id) -> devuelve Distribucion[]
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto p-2">
      
      {/* PANEL IZQUIERDO: SELECCIÓN */}
      <section className="bg-[#1a1c1e] p-6 rounded-[2.5rem] shadow-2xl border border-gray-800">
        <h2 className="text-xl font-black italic text-white uppercase mb-6 flex items-center gap-3">
          <span className="w-3 h-6 bg-blue-500 rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span> 
          Explorador de Títulos
        </h2>

        <div className="flex gap-2 mb-8 bg-[#2d2f31] p-2 rounded-2xl border border-white/5">
          <input 
            className="flex-1 bg-transparent outline-none text-sm font-bold px-4 text-white placeholder:text-gray-600" 
            placeholder="Cédula del Titular..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
          />
          <button 
            onClick={buscarBienes}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg"
          >
            {buscandoProps ? "..." : "BUSCAR"}
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => cargarPlanCompleto(p)}
              className={`p-5 rounded-[1.8rem] border-2 cursor-pointer transition-all ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-blue-600/10 border-blue-500" 
                : "bg-[#2d2f31] border-transparent hover:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-blue-400">ID #{p.idPropiedad.toString()}</span>
                {p.enHerencia && <span className="text-[8px] text-green-500 font-bold uppercase italic tracking-widest">● Registrado</span>}
              </div>
              <p className="text-sm font-bold text-gray-200">{p.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PANEL DERECHO: DETALLE DEL PLAN */}
      <section className={`bg-[#1a1c1e] p-6 rounded-[2.5rem] shadow-2xl border-t-8 border-blue-600 transition-all duration-500 ${!propSeleccionada ? 'opacity-20 grayscale' : 'opacity-100'}`}>
        <h2 className="text-xl font-black italic text-white uppercase mb-6">Plan de Adjudicación</h2>

        {consultandoPlan ? (
          <div className="flex justify-center py-20 italic text-blue-500 font-bold animate-pulse">Consultando Blockchain...</div>
        ) : planDistribucion.length > 0 ? (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Activo:</p>
               <p className="text-sm font-bold text-blue-400 italic">{propSeleccionada?.descripcion}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase ml-1">Beneficiarios Designados:</p>
              {planDistribucion.map((dist, i) => (
                <div key={i} className="flex justify-between items-center bg-[#2d2f31] p-5 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Heredero #{i+1}</span>
                    <span className="text-sm font-bold text-white tracking-tight">CI: {dist.ciHeredero}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{dist.porcentaje.toString()}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-gray-700 text-center">
              <div className="inline-block p-4 rounded-full bg-blue-600/10 border border-blue-600/20">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Estado del Título</p>
                <p className="text-xs font-bold text-white uppercase italic">Listo para Ejecución Legal</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-600 text-[10px] uppercase font-black tracking-[0.3em]">Sin datos disponibles</p>
            <p className="text-gray-700 text-[9px] mt-2">Selecciona un bien con plan activo para ver el desglose</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default VisualizadorPlanHerencia;