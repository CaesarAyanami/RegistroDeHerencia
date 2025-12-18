import React, { useState } from "react";

const ConsultarPlanHerencia = ({
  contract,
  propContract,
  personaContract,
  showNotification,
}) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [protocolo, setProtocolo] = useState([]);
  const [cargandoProtocolo, setCargandoProtocolo] = useState(false);

  // --- LÓGICA MANTENIDA ---
  const buscarBienes = async () => {
    if (!ciDueno.trim()) return showNotification("Ingresa la CI", "alert");
    setPropSeleccionada(null);
    setBuscandoProps(true);
    try {
      const data = await propContract.methods
        .listarPropiedadesPorCI(ciDueno.trim())
        .call();
      setPropiedades(data);
    } catch (e) {
      showNotification("Error de consulta", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const cargarDetalleHerencia = async (prop) => {
    setPropSeleccionada(prop);
    setCargandoProtocolo(true);
    try {
      const id = prop.idPropiedad;
      const cisHerederos = await contract.methods
        .obtenerCiConParticipacion(id)
        .call();
      const promesas = cisHerederos.map(async (ci) => {
        const porc = await contract.methods.obtenerParticipacion(id, ci).call();
        const p = await personaContract.methods.obtenerPersonaPorCI(ci).call();
        return {
          ci,
          porc,
          nombre: `${p.nombres} ${p.apellidos}`,
          genero: p.genero,
        };
      });
      setProtocolo(await Promise.all(promesas));
    } catch (e) {
      showNotification("Error en protocolo", "error");
    } finally {
      setCargandoProtocolo(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full animate-in fade-in duration-700">
      {/* PANEL IZQUIERDO: SELECCIÓN DE ACTIVOS (Ancho fijo en XL para dar estabilidad) */}
      <section className="w-full xl:w-[400px] bg-[#0d0f14] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/20"></div>

        {/* BUSCADOR ESTILIZADO */}
        <div className="space-y-3 mb-8">
          <div className="bg-black/40 border border-white/5 p-1 rounded-2xl focus-within:border-blue-500/40 transition-all">
            <input
              className="w-full bg-transparent outline-none text-xs font-bold text-white px-4 py-3 placeholder:text-gray-700 uppercase tracking-widest"
              placeholder="Cédula Titular..."
              value={ciDueno}
              onChange={(e) => setCiDueno(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscarBienes()}
            />
          </div>
          <button
            onClick={buscarBienes}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
          >
            {buscandoProps ? "Sincronizando..." : "Consultar Registro"}
          </button>
        </div>

        {/* LISTA DE CARDS DE ACTIVOS */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div
              key={idx}
              onClick={() => cargarDetalleHerencia(p)}
              className={`p-5 rounded-[1.8rem] border-2 cursor-pointer transition-all duration-300 group ${
                propSeleccionada?.idPropiedad === p.idPropiedad
                  ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "bg-black/20 border-transparent hover:border-white/10"
              }`}
            >
              <div className="flex flex-col gap-1">
                <span
                  className={`text-[8px] font-black uppercase tracking-widest ${
                    propSeleccionada?.idPropiedad === p.idPropiedad
                      ? "text-blue-400"
                      : "text-gray-600"
                  }`}
                >
                  Asset ID: #{p.idPropiedad.toString()}
                </span>
                <p
                  className={`text-[11px] font-bold uppercase ${
                    propSeleccionada?.idPropiedad === p.idPropiedad
                      ? "text-white"
                      : "text-gray-500"
                  }`}
                >
                  {p.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PANEL DERECHO: PROTOCOLO DE HEREDEROS (Toma el resto del espacio) */}
      <section
        className={`flex-1 bg-[#0d0f14] border border-white/5 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden transition-all duration-700 min-h-[600px] ${
          !propSeleccionada ? "opacity-20 grayscale blur-[1px]" : "opacity-100"
        }`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 text-4xl italic font-black text-blue-500">
          PROTOCOL
        </div>

        <header className="mb-12">
          <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
            Protocolo de{" "}
            <span className="text-blue-500 text-outline-sm">Distribución</span>
          </h2>
          {propSeleccionada && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                Monitoreando Activo: {propSeleccionada.descripcion}
              </span>
            </div>
          )}
        </header>

        {cargandoProtocolo ? (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
              Cruzando Datos...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protocolo.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-black/40 border border-white/5 p-6 rounded-[2rem] group hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#16181d] rounded-2xl flex items-center justify-center text-2xl border border-white/5 group-hover:scale-110 transition-transform">
                    {Number(h.genero) === 0
                      ? "👨"
                      : Number(h.genero) === 1
                      ? "👩"
                      : "👤"}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase italic mb-1">
                      {h.nombre}
                    </h4>
                    <p className="text-[9px] font-bold text-gray-600 tracking-tighter uppercase">
                      ID: {h.ci}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-blue-500 italic leading-none">
                    {h.porc}%
                  </div>
                  <p className="text-[7px] font-black text-gray-700 uppercase mt-1 tracking-widest">
                    Cuota Part.
                  </p>
                </div>
              </div>
            ))}

            {protocolo.length === 0 && propSeleccionada && (
              <div className="col-span-2 py-32 text-center opacity-20 italic text-xs uppercase text-white tracking-[0.4em]">
                No hay herederos en este activo
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConsultarPlanHerencia;
