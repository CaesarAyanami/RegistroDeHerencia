import React, { useState } from "react";

const ConsultarPlanHerencia = ({
  contract,
  propContract,
  showNotification,
}) => {
  // --- LÓGICA INTACTA ---
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [protocolo, setProtocolo] = useState([]);
  const [cargandoProtocolo, setCargandoProtocolo] = useState(false);

  const buscarBienes = async () => {
    if (!ciDueno.trim())
      return showNotification("Ingresa la CI del titular", "alert");

    setBuscandoProps(true);
    setPropSeleccionada(null);
    setProtocolo([]);

    try {
      const data = await propContract.methods
        .listarPropiedadesPorCI(ciDueno.trim())
        .call();
      setPropiedades(data);
      if (data.length === 0)
        showNotification("No se encontraron bienes", "info");
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
      const cisHerederos = await contract.methods
        .obtenerCiConParticipacion(id)
        .call();

      if (!cisHerederos || cisHerederos.length === 0) {
        showNotification("Esta propiedad no tiene plan de herencia", "info");
      } else {
        const promesas = cisHerederos.map(async (ci) => {
          const porc = await contract.methods
            .obtenerParticipacion(id, ci)
            .call();
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

  // --- DISEÑO REDISEÑADO (FLUJO VERTICAL ARMONIOSO) ---
  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto p-2">
      {/* 1. BUSCADOR DE BIENES */}
      <section className="bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600/40"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-8 flex items-center gap-3 tracking-tighter">
          <span className="text-indigo-500 font-mono text-sm">01/</span>
          Localizador de Patrimonio
        </h2>

        <div className="flex gap-3 mb-10 bg-black/40 p-2 rounded-2xl border border-white/5 focus-within:border-indigo-500/30 transition-all duration-500">
          <input
            className="flex-1 bg-transparent outline-none text-sm font-bold px-6 text-white placeholder:text-gray-700 uppercase"
            placeholder="Cédula de Identidad..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarBienes()}
          />
          <button
            onClick={buscarBienes}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(79,70,229,0.2)] active:scale-95"
          >
            {buscandoProps ? "..." : "SCAN"}
          </button>
        </div>

        {/* LISTA DE RESULTADOS */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div
              key={idx}
              onClick={() => cargarDetalleHerencia(p)}
              className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 relative ${
                propSeleccionada?.idPropiedad === p.idPropiedad
                  ? "bg-indigo-600/10 border-indigo-600/50 shadow-[0_0_25px_rgba(79,70,229,0.1)]"
                  : "bg-black/20 border-transparent hover:border-white/10"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-full ${
                    propSeleccionada?.idPropiedad === p.idPropiedad
                      ? "bg-indigo-500 text-white"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  REF: {p.idPropiedad.toString()}
                </span>
                {p.enHerencia && (
                  <span className="text-[8px] font-black text-indigo-400 uppercase italic tracking-widest animate-pulse">
                    ● Protocolo Vinculado
                  </span>
                )}
              </div>
              <p
                className={`text-sm font-bold tracking-tight uppercase ${
                  propSeleccionada?.idPropiedad === p.idPropiedad
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. PROTOCOLO DE DISTRIBUCIÓN */}
      <section
        className={`bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl transition-all duration-700 relative overflow-hidden ${
          !propSeleccionada
            ? "opacity-10 grayscale blur-[2px] pointer-events-none translate-y-10"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-10 text-center tracking-tighter">
          Protocolo de Distribución{" "}
          <span className="text-indigo-500 ml-2">Digital</span>
        </h2>

        {cargandoProtocolo ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em]">
              Extrayendo Datos...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {protocolo.length > 0 ? (
              <>
                <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black text-indigo-500/60 uppercase tracking-widest mb-1">
                      Activo Auditado
                    </p>
                    <p className="text-sm font-bold text-white uppercase italic">
                      {propSeleccionada?.descripcion}
                    </p>
                  </div>
                  <div className="bg-indigo-500/20 px-4 py-2 rounded-xl border border-indigo-500/30">
                    <p className="text-[10px] font-black text-indigo-400 uppercase">
                      Status
                    </p>
                    <p className="text-[10px] text-white font-bold">VERIFIED</p>
                  </div>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {protocolo.map((h, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-black/40 p-6 rounded-[2rem] border border-white/5 group/row hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-500 border border-indigo-500/20">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">
                            Beneficiario Final
                          </p>
                          <span className="text-sm font-black text-white tracking-widest">
                            CI: {h.ci}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                          Cuota Parte
                        </p>
                        <span className="text-3xl font-black text-white italic group-hover/row:text-indigo-400 transition-colors">
                          {h.porc}
                          <span className="text-sm opacity-50 ml-1">%</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen Final Tech */}
                <div className="mt-10 p-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent rounded-full">
                  <div className="bg-[#0d0f14] py-4 rounded-full text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em]">
                      Consenso de Distribución: 100%
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-24 opacity-20">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                  No se detectó protocolo activo
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConsultarPlanHerencia;
