import React, { useState } from "react";

const ConsultaPuntualParticipacion = ({
  contract,
  propContract,
  showNotification,
}) => {
  // --- LÓGICA INTACTA ---
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [ciHeredero, setCiHeredero] = useState("");
  const [resultado, setResultado] = useState(null);
  const [consultando, setConsultando] = useState(false);

  const buscarBienesDelDuenio = async () => {
    if (!ciDueno.trim())
      return showNotification("Ingresa la CI del titular", "alert");
    setBuscandoProps(true);
    setPropSeleccionada(null);
    setResultado(null);
    try {
      const data = await propContract.methods
        .listarPropiedadesPorCI(ciDueno.trim())
        .call();
      setPropiedades(data);
      if (data.length === 0)
        showNotification("No se encontraron bienes para esta CI", "info");
    } catch (e) {
      showNotification("Error al consultar el registro", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const consultarCuotaEspecifica = async () => {
    if (!propSeleccionada)
      return showNotification("Selecciona una propiedad primero", "alert");
    if (!ciHeredero.trim())
      return showNotification("Ingresa la CI del heredero", "alert");
    setConsultando(true);
    setResultado(null);
    try {
      const id = propSeleccionada.idPropiedad;
      const porcentaje = await contract.methods
        .obtenerParticipacion(parseInt(id), ciHeredero.trim())
        .call();
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

  // --- DISEÑO REDISEÑADO (FLUJO VERTICAL ARMONIOSO) ---
  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto p-2">
      {/* 1. SELECCIÓN DE ACTIVO */}
      <section className="bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-8 flex items-center gap-3 tracking-tighter">
          <span className="text-amber-500 font-mono text-sm">01/</span>
          Localizar Propiedad
        </h2>

        <div className="flex gap-3 mb-10 bg-black/40 p-2 rounded-2xl border border-white/5 focus-within:border-amber-500/30 transition-all duration-500">
          <input
            className="flex-1 bg-transparent outline-none text-sm font-bold px-6 text-white placeholder:text-gray-700 uppercase"
            placeholder="CI del Dueño del Bien..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && buscarBienesDelDuenio()}
          />
          <button
            onClick={buscarBienesDelDuenio}
            className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(245,158,11,0.1)] active:scale-95"
          >
            {buscandoProps ? "..." : "Localizar"}
          </button>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div
              key={idx}
              onClick={() => {
                setPropSeleccionada(p);
                setResultado(null);
              }}
              className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 ${
                propSeleccionada?.idPropiedad === p.idPropiedad
                  ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.1)]"
                  : "bg-black/20 border-transparent hover:border-white/10"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-[9px] font-black px-3 py-1 rounded-full ${
                    propSeleccionada?.idPropiedad === p.idPropiedad
                      ? "bg-amber-500 text-white"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  TÍTULO #{p.idPropiedad.toString()}
                </span>
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
          {propiedades.length === 0 && !buscandoProps && (
            <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20">
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                Esperando Datos de Dueño
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. CONSULTA ESPECÍFICA */}
      <section
        className={`bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl transition-all duration-700 relative ${
          !propSeleccionada
            ? "opacity-10 grayscale blur-[2px] pointer-events-none translate-y-10"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-amber-500 to-transparent opacity-50"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-10 text-center tracking-tighter">
          Verificación de <span className="text-amber-500">Cuota</span>
        </h2>

        <div className="max-w-md mx-auto space-y-8">
          {/* Badge del Bien seleccionado */}
          <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-center">
            <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-1">
              Activo en Análisis
            </p>
            <p className="text-xs font-bold text-white italic truncate px-4">
              {propSeleccionada?.descripcion || "Ninguno"}
            </p>
          </div>

          {/* Input de Heredero */}
          <div className="bg-black/40 p-4 rounded-3xl border border-white/5 focus-within:border-amber-500/30 transition-all">
            <p className="text-[8px] font-black text-gray-500 uppercase px-3 mb-2 tracking-widest">
              CI del Heredero a Consultar
            </p>
            <input
              className="w-full bg-transparent outline-none text-base font-black px-3 text-white placeholder:text-gray-800 tracking-widest"
              placeholder="Ej: V-20444..."
              value={ciHeredero}
              onChange={(e) => setCiHeredero(e.target.value)}
            />
          </div>

          <button
            onClick={consultarCuotaEspecifica}
            disabled={consultando || !propSeleccionada}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 disabled:opacity-20"
          >
            {consultando ? "Sincronizando..." : "Verificar Participación"}
          </button>

          {/* RESULTADO (EL SELLO) */}
          {resultado && (
            <div className="mt-8 relative animate-in zoom-in-95 duration-500">
              <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full"></div>
              <div className="relative bg-black/60 p-8 rounded-[3rem] border border-amber-500/20 text-center">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] mb-4">
                  Resultado de Auditoría
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-7xl font-black text-white italic tracking-tighter">
                    {resultado.porcentaje}
                  </span>
                  <span className="text-2xl font-black text-amber-500">%</span>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                    Asignado a: {resultado.ci}
                  </p>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                    Inmueble ID: {resultado.id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConsultaPuntualParticipacion;
