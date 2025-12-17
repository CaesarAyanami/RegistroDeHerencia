import React, { useState } from "react";

const DefinirHerencia = ({ contract, propContract, onPrepare, showNotification }) => {
  // Estados del Buscador
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [listaPropiedades, setListaPropiedades] = useState([]);
  const [buscando, setBuscando] = useState(false);
  
  // Estados de la Herencia
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
  const [herederos, setHerederos] = useState([]); 
  const [tempCi, setTempCi] = useState("");
  const [tempPorc, setTempPorc] = useState("");

  const consultarBienes = async () => {
    if (!ciBusqueda.trim()) return showNotification("Ingresa la CI del titular", "alert");
    setBuscando(true);
    setPropiedadSeleccionada(null);
    try {
      const data = await propContract.methods.listarPropiedadesPorCI(ciBusqueda.trim()).call();
      setListaPropiedades(data);
      if (data.length === 0) showNotification("No se encontraron bienes para esta CI", "info");
    } catch (e) {
      showNotification("Error al consultar el registro de propiedades", "error");
    } finally {
      setBuscando(false);
    }
  };

  const agregarHeredero = () => {
    if (!tempCi.trim() || !tempPorc) return showNotification("Completa los datos del heredero", "alert");
    const porcNum = parseInt(tempPorc);
    if (isNaN(porcNum) || porcNum <= 0) return showNotification("Porcentaje inválido", "alert");
    
    const totalActual = herederos.reduce((acc, curr) => acc + curr.porc, 0);
    if (totalActual + porcNum > 100) return showNotification("La suma supera el 100%", "error");
    
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
    if (total !== 100) return showNotification("La suma debe ser exactamente 100%", "error");
    if (!propiedadSeleccionada) return showNotification("Selecciona una propiedad", "error");

    const cis = herederos.map(h => h.ci);
    const porcs = herederos.map(h => h.porc);

    try {
      // 🔹 CAMBIO CLAVE: Ahora pasamos 4 argumentos según tu nuevo Herencias.sol:
      // 1. ID, 2. CI del Dueño, 3. Lista CIs Herederos, 4. Lista Porcentajes
      const metodo = contract.methods.definirHerencia(
        propiedadSeleccionada.idPropiedad, 
        ciBusqueda.trim(), // Este es el _ciDueno que pide el contrato
        cis, 
        porcs
      );
      
      onPrepare(metodo);
    } catch (err) {
      showNotification("Error al construir la transacción", "error");
    }
  };

  const totalPorc = herederos.reduce((acc, curr) => acc + curr.porc, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-2">
      
      {/* SECCIÓN 1: BUSCADOR DE ACTIVOS */}
      <section className="bg-[#1a1c1e] p-6 rounded-[2.5rem] shadow-2xl border border-gray-800">
        <h2 className="text-xl font-black italic text-white uppercase mb-6 flex items-center gap-3">
          <span className="w-3 h-6 bg-purple-500 rounded-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]"></span> 
          1. Activos del Titular
        </h2>

        <div className="flex gap-2 mb-8 bg-[#2d2f31] p-2 rounded-2xl border border-white/5">
          <input 
            className="flex-1 bg-transparent outline-none text-sm font-bold px-4 text-white placeholder:text-gray-500" 
            placeholder="Cédula del Propietario..."
            value={ciBusqueda}
            onChange={(e) => setCiBusqueda(e.target.value)}
          />
          <button 
            onClick={consultarBienes}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all shadow-lg"
          >
            {buscando ? "..." : "BUSCAR"}
          </button>
        </div>

        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          {listaPropiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setPropiedadSeleccionada(p);
                setHerederos([]); // Limpiar herederos al cambiar de propiedad
              }}
              className={`p-5 rounded-[1.8rem] border-2 cursor-pointer transition-all ${
                propiedadSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-purple-600/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.1)]" 
                : "bg-[#2d2f31] border-transparent hover:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-tighter">
                  Registro #{p.idPropiedad.toString()}
                </span>
                {p.enHerencia && (
                  <span className="text-[8px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md font-black uppercase italic">
                    Plan Existente
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-gray-200 leading-tight">
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: CONFIGURACIÓN DE HERENCIA */}
      <section className={`bg-[#1a1c1e] p-6 rounded-[2.5rem] shadow-2xl border-t-8 border-purple-600 transition-all duration-500 ${!propiedadSeleccionada ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
        <h2 className="text-xl font-black italic text-white uppercase mb-6">2. Distribución de Bienes</h2>
        
        <div className="mb-6 p-4 bg-purple-600/10 rounded-2xl border border-purple-500/20">
          <p className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Activo Seleccionado:</p>
          <p className="text-sm font-bold text-white truncate">{propiedadSeleccionada?.descripcion || "Ninguno"}</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-[#2d2f31] border border-gray-700 p-4 rounded-xl text-sm font-bold text-white outline-none focus:border-purple-500 transition-all" 
              placeholder="CI del Heredero"
              value={tempCi} onChange={e => setTempCi(e.target.value)}
            />
            <input 
              className="w-20 bg-[#2d2f31] border border-gray-700 p-4 rounded-xl text-sm font-bold text-white text-center outline-none focus:border-purple-500 transition-all" 
              placeholder="%"
              type="number"
              value={tempPorc} onChange={e => setTempPorc(e.target.value)}
            />
            <button onClick={agregarHeredero} className="bg-white text-black px-6 rounded-xl font-black text-lg hover:bg-purple-500 hover:text-white transition-all">+</button>
          </div>

          <div className="space-y-2 min-h-[180px] bg-[#121416] p-4 rounded-2xl border border-white/5">
            {herederos.length === 0 && (
              <p className="text-gray-600 text-[10px] text-center mt-16 uppercase font-bold tracking-widest italic">No hay herederos agregados</p>
            )}
            {herederos.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-[#2d2f31] p-4 rounded-xl border border-white/5 group">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-gray-500 uppercase">Beneficiario</span>
                   <span className="text-xs font-bold text-white">CI: {h.ci}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-purple-500">{h.porc}%</span>
                  <button onClick={() => eliminarHeredero(i)} className="text-gray-600 hover:text-red-500 font-bold text-xs transition-all opacity-0 group-hover:opacity-100">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-4 px-2 bg-white/5 rounded-xl">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Acumulado:</span>
             <span className={`text-2xl font-black ${totalPorc === 100 ? 'text-green-500' : 'text-purple-500'}`}>{totalPorc}%</span>
          </div>

          <button 
            onClick={prepararTransaccion}
            disabled={totalPorc !== 100}
            className={`w-full py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-2xl transform active:scale-95 ${
              totalPorc === 100 
              ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-500/20' 
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            Protocolizar Herencia
          </button>
        </div>
      </section>
    </div>
  );
};

export default DefinirHerencia;