import React, { useState } from "react";

const VisualizadorPlanHerencia = ({
  contract,
  propContract,
  showNotification,
}) => {
  // --- LÓGICA INTACTA ---
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [planDistribucion, setPlanDistribucion] = useState([]);
  const [consultandoPlan, setConsultandoPlan] = useState(false);

  const buscarBienes = async () => {
    if (!ciDueno.trim())
      return showNotification("Ingresa la CI del titular", "alert");
    setBuscandoProps(true);
    setPropSeleccionada(null);
    setPlanDistribucion([]);

    try {
      const data = await propContract.methods
        .listarPropiedadesPorCI(ciDueno.trim())
        .call();
      setPropiedades(data);
      if (data.length === 0)
        showNotification("No hay bienes para esta cédula", "info");
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
      const data = await contract.methods
        .obtenerHerencia(propiedad.idPropiedad)
        .call();

      if (!data || data.length === 0) {
        showNotification(
          "Este bien no tiene un plan de herencia registrado",
          "info"
        );
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

  // --- INTERFAZ REDISEÑADA (FLUJO VERTICAL) ---
  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto p-4">
      {/* BLOQUE 1: EXPLORADOR (SELECCIÓN) */}
      <section className="bg-[#0d0f14] p-8 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden group">
        {/* Decoración tech sutil */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] pointer-events-none"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-8 flex items-center gap-4 tracking-tighter">
          <span className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]"></span>
          Explorador de Títulos
        </h2>

        {/* INPUT DE BÚSQUEDA */}
        <div className="flex gap-3 mb-10 bg-black/40 p-2 rounded-2xl border border-white/5 focus-within:border-blue-500/30 transition-all duration-500">
          <input
            className="flex-1 bg-transparent outline-none text-sm font-bold px-6 text-white placeholder:text-gray-700 uppercase tracking-widest"
            placeholder="Cédula del Titular..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
          />
          <button
            onClick={buscarBienes}
            disabled={buscandoProps}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_10px_20px_rgba(59,130,246,0.15)] active:scale-95 disabled:opacity-30"
          >
            {buscandoProps ? "..." : "Localizar"}
          </button>
        </div>

        {/* LISTA DE RESULTADOS (SCROLLABLE) */}
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
          {propiedades.length > 0 ? (
            propiedades.map((p, idx) => (
              <div
                key={idx}
                onClick={() => cargarPlanCompleto(p)}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 relative group/item ${
                  propSeleccionada?.idPropiedad === p.idPropiedad
                    ? "bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] scale-[1.01]"
                    : "bg-black/20 border-transparent hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-[10px] font-black tracking-widest ${
                      propSeleccionada?.idPropiedad === p.idPropiedad
                        ? "text-blue-400"
                        : "text-gray-600"
                    }`}
                  >
                    ACTIVO ID: {p.idPropiedad.toString()}
                  </span>
                  {p.enHerencia && (
                    <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest">
                        Plan Activo
                      </span>
                    </div>
                  )}
                </div>
                <p
                  className={`text-sm font-bold tracking-tight leading-relaxed ${
                    propSeleccionada?.idPropiedad === p.idPropiedad
                      ? "text-white"
                      : "text-gray-400"
                  }`}
                >
                  {p.descripcion}
                </p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20">
              <p className="text-[9px] font-black uppercase tracking-[0.5em]">
                Esperando Identificación
              </p>
            </div>
          )}
        </div>
      </section>

      {/* BLOQUE 2: DETALLE DEL PLAN (AUDITORÍA) */}
      <section
        className={`bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl transition-all duration-700 relative overflow-hidden ${
          !propSeleccionada
            ? "opacity-10 grayscale pointer-events-none translate-y-8"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-8 tracking-tighter">
          Desglose de Adjudicación
        </h2>

        {consultandoPlan ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse">
              Analizando Bloques...
            </p>
          </div>
        ) : planDistribucion.length > 0 ? (
          <div className="space-y-6">
            {/* Cabecera del Activo Seleccionado */}
            <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 backdrop-blur-sm">
              <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.3em] mb-2">
                Resumen del Activo
              </p>
              <p className="text-base font-bold text-white italic">
                "{propSeleccionada?.descripcion}"
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 mb-4">
                Estructura de Beneficiarios
              </p>

              {planDistribucion.map((dist, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-black/40 p-6 rounded-[2rem] border border-white/5 group/row hover:bg-black/60 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-[10px] font-black text-gray-700 w-8">
                      0{i + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">
                        Identificación Legal
                      </span>
                      <span className="text-sm font-black text-white tracking-[0.1em]">
                        CI: {dist.ciHeredero}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest block mb-1">
                      Cuota
                    </span>
                    <span className="text-3xl font-black text-white italic group-hover/row:text-blue-500 transition-colors">
                      {dist.porcentaje.toString()}
                      <span className="text-sm ml-0.5 opacity-50">%</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sello de Verificación Inferior */}
            <div className="mt-12 flex justify-center">
              <div className="px-8 py-4 rounded-2xl bg-black border border-white/5 flex items-center gap-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></div>
                <div>
                  <p className="text-[9px] font-black text-white uppercase tracking-[0.3em]">
                    Protocolo Verificado
                  </p>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1 italic text-center">
                    Inmueble listo para traspaso
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">
              Seleccione un activo verificado
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default VisualizadorPlanHerencia;
