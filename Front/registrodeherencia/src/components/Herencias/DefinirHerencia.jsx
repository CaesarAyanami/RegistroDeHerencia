import React, { useState } from "react";

const DefinirHerencia = ({
  contract,
  propContract,
  onPrepare,
  showNotification,
}) => {
  // --- LÓGICA INTACTA ---
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [listaPropiedades, setListaPropiedades] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
  const [herederos, setHerederos] = useState([]);
  const [tempCi, setTempCi] = useState("");
  const [tempPorc, setTempPorc] = useState("");

  const consultarBienes = async () => {
    if (!ciBusqueda.trim())
      return showNotification("Ingresa la CI del titular", "alert");
    setBuscando(true);
    setPropiedadSeleccionada(null);
    try {
      const data = await propContract.methods
        .listarPropiedadesPorCI(ciBusqueda.trim())
        .call();
      setListaPropiedades(data);
      if (data.length === 0)
        showNotification("No se encontraron bienes para esta CI", "info");
    } catch (e) {
      showNotification("Error al consultar el registro", "error");
    } finally {
      setBuscando(false);
    }
  };

  const agregarHeredero = () => {
    if (!tempCi.trim() || !tempPorc)
      return showNotification("Completa los datos del heredero", "alert");
    const porcNum = parseInt(tempPorc);
    if (isNaN(porcNum) || porcNum <= 0)
      return showNotification("Porcentaje inválido", "alert");

    const totalActual = herederos.reduce((acc, curr) => acc + curr.porc, 0);
    if (totalActual + porcNum > 100)
      return showNotification("La suma supera el 100%", "error");

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
    if (total !== 100)
      return showNotification("La suma debe ser exactamente 100%", "error");
    if (!propiedadSeleccionada)
      return showNotification("Selecciona una propiedad", "error");

    const cis = herederos.map((h) => h.ci);
    const porcs = herederos.map((h) => h.porc);

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

  // --- DISEÑO REDISEÑADO (FLUJO VERTICAL DE CONFIGURACIÓN) ---
  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto p-2">
      {/* 1. SELECCIÓN DE ACTIVO PARA PROTOCOLIZAR */}
      <section className="bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[80px] pointer-events-none"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-8 flex items-center gap-4 tracking-tighter">
          <span className="w-1.5 h-8 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7]"></span>
          Selección de Patrimonio
        </h2>

        <div className="flex gap-3 mb-10 bg-black/40 p-2 rounded-2xl border border-white/5 focus-within:border-purple-500/30 transition-all duration-500">
          <input
            className="flex-1 bg-transparent outline-none text-sm font-bold px-6 text-white placeholder:text-gray-700 uppercase tracking-widest"
            placeholder="CI del Propietario..."
            value={ciBusqueda}
            onChange={(e) => setCiBusqueda(e.target.value)}
          />
          <button
            onClick={consultarBienes}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            {buscando ? "..." : "Consultar"}
          </button>
        </div>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
          {listaPropiedades.map((p, idx) => (
            <div
              key={idx}
              onClick={() => {
                setPropiedadSeleccionada(p);
                setHerederos([]);
              }}
              className={`p-6 rounded-[2.2rem] border-2 cursor-pointer transition-all duration-500 relative ${
                propiedadSeleccionada?.idPropiedad === p.idPropiedad
                  ? "bg-purple-500/10 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                  : "bg-black/20 border-transparent hover:border-white/10"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    propiedadSeleccionada?.idPropiedad === p.idPropiedad
                      ? "text-purple-400"
                      : "text-gray-600"
                  }`}
                >
                  Reg: {p.idPropiedad.toString()}
                </span>
                {p.enHerencia && (
                  <span className="text-[8px] bg-white/5 text-amber-500 px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-amber-500/20">
                    Plan Existente
                  </span>
                )}
              </div>
              <p
                className={`text-sm font-bold leading-tight ${
                  propiedadSeleccionada?.idPropiedad === p.idPropiedad
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

      {/* 2. CONFIGURACIÓN DEL PLAN DE HERENCIA */}
      <section
        className={`bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl transition-all duration-700 relative ${
          !propiedadSeleccionada
            ? "opacity-10 grayscale blur-[4px] pointer-events-none translate-y-12"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

        <h2 className="text-xl font-black italic text-white uppercase mb-8 tracking-tighter">
          Configuración de{" "}
          <span className="text-purple-500">Adjudicaciones</span>
        </h2>

        {/* Header del Activo */}
        <div className="mb-8 p-6 bg-purple-500/5 rounded-3xl border border-purple-500/10">
          <p className="text-[8px] font-black text-purple-500/60 uppercase tracking-[0.4em] mb-2">
            Activo en Protocolización
          </p>
          <p className="text-sm font-bold text-white italic">
            "{propiedadSeleccionada?.descripcion || "---"}"
          </p>
        </div>

        {/* Inputs de Herederos */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-10">
          <div className="md:col-span-8 bg-black/40 p-2 rounded-2xl border border-white/5 focus-within:border-purple-500/30 transition-all">
            <input
              className="w-full bg-transparent outline-none text-sm font-bold px-4 py-2 text-white placeholder:text-gray-800"
              placeholder="CI del Heredero..."
              value={tempCi}
              onChange={(e) => setTempCi(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 bg-black/40 p-2 rounded-2xl border border-white/5 focus-within:border-purple-500/30 transition-all">
            <input
              className="w-full bg-transparent outline-none text-sm font-black px-2 py-2 text-white text-center placeholder:text-gray-800"
              placeholder="%"
              type="number"
              value={tempPorc}
              onChange={(e) => setTempPorc(e.target.value)}
            />
          </div>
          <button
            onClick={agregarHeredero}
            className="md:col-span-2 bg-white text-black rounded-2xl font-black text-xl hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-lg"
          >
            +
          </button>
        </div>

        {/* Lista de Herederos */}
        <div className="space-y-3 min-h-[220px] bg-black/20 p-6 rounded-[2.5rem] border border-white/5 mb-8">
          {herederos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-16">
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                Sin Asignaciones
              </p>
            </div>
          ) : (
            herederos.map((h, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-black/40 p-5 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest mb-1">
                    Heredero Designado
                  </span>
                  <span className="text-sm font-bold text-white tracking-widest uppercase">
                    CI: {h.ci}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black text-white italic">
                    {h.porc}%
                  </span>
                  <button
                    onClick={() => eliminarHeredero(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer de Acción */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-8 py-6 bg-white/5 rounded-[2rem] border border-white/5">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
              Carga de Adjudicación
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl font-black italic transition-colors ${
                  totalPorc === 100 ? "text-green-500" : "text-purple-500"
                }`}
              >
                {totalPorc}
              </span>
              <span className="text-lg font-black text-gray-600">%</span>
            </div>
          </div>

          <button
            onClick={prepararTransaccion}
            disabled={totalPorc !== 100}
            className={`w-full py-6 rounded-[2.2rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] ${
              totalPorc === 100
                ? "bg-purple-600 text-white hover:bg-purple-500 shadow-purple-600/20"
                : "bg-white/5 text-gray-700 cursor-not-allowed grayscale"
            }`}
          >
            Protocolizar en Blockchain
          </button>
        </div>
      </section>
    </div>
  );
};

export default DefinirHerencia;
