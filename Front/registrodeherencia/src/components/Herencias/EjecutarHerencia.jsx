import React, { useState } from "react";

const EjecutarHerencia = ({
  contract,
  propContract,
  onPrepare,
  showNotification,
}) => {
  // --- LÓGICA INTACTA ---
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [ciHeredero, setCiHeredero] = useState("");

  const buscarBienes = async () => {
    if (!propContract)
      return showNotification("Contrato Propiedades no detectado", "error");
    if (!ciDueno.trim())
      return showNotification("Ingrese CI del titular fallecido", "alert");

    setBuscandoProps(true);
    setPropiedades([]);
    setPropSeleccionada(null);

    try {
      const data = await propContract.methods
        .listarPropiedadesPorCI(ciDueno.trim())
        .call();

      if (!data || data.length === 0) {
        showNotification("Cédula sin activos registrados", "info");
      } else {
        setPropiedades(data);
        showNotification(`${data.length} activos localizados`, "success");
      }
    } catch (e) {
      showNotification("Error de conexión con la Blockchain", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const prepararTransaccion = async () => {
    if (!propSeleccionada)
      return showNotification("Seleccione un bien de la lista", "alert");
    if (!ciHeredero.trim())
      return showNotification("Ingrese la CI del heredero", "alert");

    try {
      const id = propSeleccionada.idPropiedad;
      const plan = await contract.methods.obtenerHerencia(id).call();

      if (!plan || plan.length === 0) {
        return showNotification(
          "Este bien no tiene un plan de herencia definido",
          "error"
        );
      }

      const metodo = contract.methods.ejecutarHerencia(id, ciHeredero.trim());
      onPrepare(metodo);
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || "Error desconocido";
      showNotification(
        errorMsg.includes("revert")
          ? "La Blockchain rechazó la ejecución"
          : "Error de comunicación",
        "error"
      );
    }
  };

  // --- DISEÑO REDISEÑADO (FLUJO VERTICAL DE EJECUCIÓN FINAL) ---
  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto p-2">
      {/* 1. IDENTIFICACIÓN DEL CAUSANTE */}
      <section className="bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500/40"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-8 flex items-center gap-4 tracking-tighter">
          <span className="text-green-500 font-mono text-sm">01/</span>
          Identificar Causante
        </h2>

        <div className="flex gap-3 mb-10 bg-black/40 p-2 rounded-2xl border border-white/5 focus-within:border-green-500/30 transition-all duration-500">
          <input
            className="flex-1 bg-transparent outline-none text-sm font-bold px-6 text-white placeholder:text-gray-700 uppercase"
            placeholder="Cédula del Titular Fallecido..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
          />
          <button
            onClick={buscarBienes}
            disabled={buscandoProps}
            className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(34,197,94,0.1)] active:scale-95"
          >
            {buscandoProps ? "..." : "Localizar"}
          </button>
        </div>

        {/* Listado de Activos con scroll suave */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div
              key={idx}
              onClick={() => setPropSeleccionada(p)}
              className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-500 ${
                propSeleccionada?.idPropiedad === p.idPropiedad
                  ? "bg-green-500/10 border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.1)]"
                  : "bg-black/20 border-transparent hover:border-white/10"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-full ${
                    propSeleccionada?.idPropiedad === p.idPropiedad
                      ? "bg-green-500 text-white"
                      : "bg-white/5 text-gray-500"
                  }`}
                >
                  ACTIVO #{p.idPropiedad.toString()}
                </span>
                {p.enHerencia && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">
                      Plan Listo
                    </span>
                  </div>
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
          {propiedades.length === 0 && !buscandoProps && (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20">
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">
                Esperando Identificación
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. ADJUDICACIÓN DE TÍTULO */}
      <section
        className={`bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl transition-all duration-700 relative overflow-hidden ${
          !propSeleccionada
            ? "opacity-10 grayscale blur-[4px] pointer-events-none translate-y-12"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-10 text-center tracking-tighter">
          Adjudicación de{" "}
          <span className="text-green-500 font-black">Nuevo Título</span>
        </h2>

        <div className="max-w-md mx-auto space-y-8">
          {/* Resumen del Bien Seleccionado */}
          <div className="p-5 bg-green-500/5 rounded-3xl border border-green-500/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-500/20">
              <span className="text-green-500 text-xl font-black">ID</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black text-green-500/60 uppercase tracking-widest mb-1">
                Activo a Traspasar
              </p>
              <p className="text-xs font-bold text-white truncate uppercase tracking-tight">
                {propSeleccionada?.descripcion || "---"}
              </p>
            </div>
          </div>

          {/* Campo de CI Heredero */}
          <div className="bg-black/40 p-4 rounded-3xl border border-white/5 focus-within:border-green-500/30 transition-all">
            <p className="text-[8px] font-black text-gray-500 uppercase px-3 mb-2 tracking-[0.2em]">
              Cédula del Nuevo Propietario
            </p>
            <input
              className="w-full bg-transparent outline-none text-base font-black px-3 text-white placeholder:text-gray-800 tracking-widest"
              placeholder="V-00.000.000"
              value={ciHeredero}
              onChange={(e) => setCiHeredero(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button
              onClick={prepararTransaccion}
              className="group relative w-full bg-white text-black py-6 rounded-[2.2rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-green-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                Firmar Traspaso de Título
              </span>
            </button>

            <p className="mt-6 text-[8px] text-center text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
              Al firmar, se actualizará el Ledger de Propiedades <br />
              vinculando el activo al nuevo titular legal.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EjecutarHerencia;
