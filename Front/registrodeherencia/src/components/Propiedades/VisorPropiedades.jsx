import React, { useState, useEffect } from "react";

const VisorPropiedades = ({ contract, showNotification }) => {
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [lista, setLista] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // LIMPIEZA AUTOMÁTICA AL CAMBIAR EL INPUT
  // Esto asegura que si cambias de V20 a V30, la pantalla se limpie al instante
  const handleInputChange = (e) => {
    const nuevoValor = e.target.value;
    setCiBusqueda(nuevoValor);
    
    // Si el usuario borra o cambia un solo caracter, limpiamos la lista previa
    if (lista.length > 0) {
      setLista([]);
    }
  };

  const consultar = async () => {
    const inputLimpio = ciBusqueda.trim();
    if (!inputLimpio) return showNotification("Ingresa una CI para buscar", "alert");
    
    setBuscando(true);
    setLista([]); // Limpieza extra de seguridad antes de la nueva petición

    try {
      const data = await contract.methods.listarPropiedadesPorCI(inputLimpio).call();
      setLista(data);
      if(data.length === 0) showNotification("No se encontraron registros", "info");
    } catch (e) {
      console.error(e);
      showNotification("Error al consultar lista", "error");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black italic text-gray-800 tracking-tight uppercase flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded-full"></span> Consulta de Títulos
        </h2>
        {lista.length > 0 && (
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-in fade-in">
            {lista.length} Registros encontrados
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-8 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-green-100 transition-all">
        <input 
          className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-600 px-4 placeholder:text-gray-300" 
          placeholder="Cédula del titular..."
          value={ciBusqueda}
          onChange={handleInputChange} // <-- Usamos la función de control de cambio
          onKeyDown={(e) => e.key === 'Enter' && consultar()}
        />
        <button 
          onClick={consultar}
          disabled={buscando}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all active:scale-95 shadow-lg shadow-green-100 disabled:bg-gray-300"
        >
          {buscando ? "BUSCANDO..." : "CONSULTAR"}
        </button>
      </div>

      <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
        {/* Spinner de carga local */}
        {buscando && (
           <div className="py-20 flex flex-col items-center justify-center animate-in fade-in">
             <div className="w-10 h-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mb-4"></div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando con Ledger...</p>
           </div>
        )}

        {/* Lista de Resultados */}
        {!buscando && lista.map((p, idx) => {
          const esPropiedadActual = p.ciDueno.toString() === ciBusqueda.trim();

          return (
            <div 
              key={idx} 
              className={`p-5 rounded-[2rem] border transition-all duration-300 animate-in zoom-in-95 ${
                esPropiedadActual 
                ? "bg-gradient-to-r from-green-50/50 to-white border-green-100 shadow-sm" 
                : "bg-gray-50/50 border-red-100 grayscale-[0.5] opacity-80 shadow-none"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-sm ${
                    esPropiedadActual ? "bg-green-600 text-white" : "bg-red-100 text-red-600"
                  }`}>
                    ID #{p.idPropiedad.toString()}
                  </span>
                  
                  {!esPropiedadActual && (
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                      Historial
                    </span>
                  )}
                </div>

                {p.enHerencia && (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                    ⚖️ En Sucesión
                  </span>
                )}
              </div>

              <p className={`text-sm font-black mb-4 ${esPropiedadActual ? "text-gray-800" : "text-gray-500 italic"}`}>
                {p.descripcion}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-dashed border-gray-200">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Titular Actual</span>
                  <span className={`text-[10px] font-bold ${esPropiedadActual ? "text-green-700" : "text-red-500"}`}>
                    CI: {p.ciDueno}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Hash de Registro</span>
                  <span className="text-[10px] font-mono text-gray-400 truncate">
                    {p.walletDueno}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Estado Vacío */}
        {!buscando && lista.length === 0 && (
          <div className="text-center py-20 animate-in fade-in duration-700">
            <div className="text-4xl mb-4 opacity-10 grayscale">🏢</div>
            <p className="opacity-20 font-black uppercase text-[9px] tracking-[0.3em]">
              {ciBusqueda ? "Presiona ENTER para buscar" : "Ingrese una cédula"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VisorPropiedades;