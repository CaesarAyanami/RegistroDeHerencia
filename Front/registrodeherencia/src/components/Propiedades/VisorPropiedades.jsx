import React, { useState } from "react";

const VisorPropiedades = ({ contract, showNotification }) => {
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [lista, setLista] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const handleInputChange = (e) => {
    const nuevoValor = e.target.value;
    setCiBusqueda(nuevoValor);
    if (lista.length > 0) setLista([]);
  };

  const consultar = async () => {
    const inputLimpio = ciBusqueda.trim();
    if (!inputLimpio)
      return showNotification("Ingresa una CI para buscar", "alert");

    setBuscando(true);
    setLista([]);

    try {
      const data = await contract.methods
        .listarPropiedadesPorCI(inputLimpio)
        .call();
      setLista(data);
      if (data.length === 0)
        showNotification("No se encontraron registros", "info");
    } catch (e) {
      console.error(e);
      showNotification("Error al consultar lista", "error");
    } finally {
      setBuscando(false);
    }
  };

  // REUTILIZANDO TUS VARIABLES DE ESTILO EXACTAS
  const cardStyle =
    "bg-[#0d0f14] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden min-h-[400px]";
  const inputContainerStyle =
    "flex gap-2 mb-8 bg-black/40 p-2 rounded-2xl border border-white/10 focus-within:border-green-500/30 transition-all";

  return (
    <section className={cardStyle}>
      {/* Header del Visor */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black italic text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="w-1.5 h-6 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></span>
            Títulos de{" "}
            <span className="text-green-500 text-outline">Propiedad</span>
          </h2>
          <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.4em] mt-1 ml-5">
            Ledger Asset Explorer
          </p>
        </div>

        {lista.length > 0 && (
          <div className="bg-green-500/10 border border-green-500/20 px-4 py-1 rounded-full">
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest animate-pulse">
              {lista.length} Entradas Detectadas
            </span>
          </div>
        )}
      </div>

      {/* Barra de Búsqueda Estilo Terminal */}
      <div className={inputContainerStyle}>
        <input
          className="flex-1 bg-transparent outline-none text-sm font-bold text-white px-4 placeholder:text-gray-700"
          placeholder="Cédula del titular a consultar..."
          value={ciBusqueda}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && consultar()}
        />
        <button
          onClick={consultar}
          disabled={buscando}
          className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-20 shadow-lg"
        >
          {buscando ? "SCANNING..." : "CONSULTAR"}
        </button>
      </div>

      {/* Área de Resultados */}
      <div className="space-y-4 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
        {/* Loading State */}
        {buscando && (
          <div className="py-20 flex flex-col items-center justify-center animate-in fade-in">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-2 border-green-500/10 border-t-green-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-[9px] font-black text-green-500/50 uppercase tracking-[0.4em]">
              Sincronizando con el Nodo...
            </p>
          </div>
        )}

        {/* Mapeo de Propiedades */}
        {!buscando &&
          lista.map((p, idx) => {
            const esPropiedadActual =
              p.ciDueno.toString() === ciBusqueda.trim();

            return (
              <div
                key={idx}
                className={`group p-6 rounded-[2rem] border transition-all duration-300 animate-in slide-in-from-bottom-2 ${
                  esPropiedadActual
                    ? "bg-white/[0.02] border-green-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                    : "bg-black/20 border-white/5 opacity-60 grayscale-[0.8]"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <span
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                        esPropiedadActual
                          ? "bg-green-500 text-black"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      Asset ID #{p.idPropiedad.toString()}
                    </span>

                    {!esPropiedadActual && (
                      <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase italic">
                        Historial Externo
                      </span>
                    )}
                  </div>

                  {p.enHerencia && (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                      <span className="animate-pulse w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      <span className="text-amber-500 text-[9px] font-black uppercase italic">
                        En Sucesión
                      </span>
                    </div>
                  )}
                </div>

                <p
                  className={`text-sm font-bold leading-relaxed mb-6 ${
                    esPropiedadActual ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {p.descripcion}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest mb-1">
                      Owner CI
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold ${
                        esPropiedadActual ? "text-green-400" : "text-gray-500"
                      }`}
                    >
                      {p.ciDueno}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest mb-1">
                      Registry Hash
                    </span>
                    <span className="text-[9px] font-mono text-gray-500 truncate hover:text-blue-400 transition-colors cursor-help">
                      {p.walletDueno}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Empty State */}
        {!buscando && lista.length === 0 && (
          <div className="text-center py-20 animate-in fade-in duration-1000">
            <div className="text-5xl mb-6 opacity-5 grayscale group-hover:grayscale-0 transition-all duration-700">
              🏢
            </div>
            <p className="text-gray-700 font-black uppercase text-[10px] tracking-[0.4em]">
              {ciBusqueda
                ? "Awaiting Query Execution..."
                : "No Data Stream Detected"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VisorPropiedades;
