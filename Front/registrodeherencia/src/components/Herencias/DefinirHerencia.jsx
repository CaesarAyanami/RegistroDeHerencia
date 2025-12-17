import React, { useState } from "react";

const DefinirHerencia = ({ contract, propContract, account, onPrepare, showNotification }) => {
  // Estados del Buscador (basados en tu VisorPropiedades)
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [listaPropiedades, setListaPropiedades] = useState([]);
  const [buscando, setBuscando] = useState(false);
  
  // Estados de la Herencia
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
  const [herederos, setHerederos] = useState([]); // [{ci, porc}]
  const [tempCi, setTempCi] = useState("");
  const [tempPorc, setTempPorc] = useState("");

  const handleInputChange = (e) => {
    setCiBusqueda(e.target.value);
    if (listaPropiedades.length > 0) setListaPropiedades([]);
    setPropiedadSeleccionada(null); // Reset si cambia la búsqueda
  };

  const consultarBienes = async () => {
    if (!ciBusqueda.trim()) return showNotification("Ingresa una CI", "alert");
    setBuscando(true);
    try {
      // Usamos el método de tu contrato de propiedades
      const data = await propContract.methods.listarPropiedadesPorCI(ciBusqueda.trim()).call();
      setListaPropiedades(data);
      if (data.length === 0) showNotification("No se encontraron bienes", "info");
    } catch (e) {
      showNotification("Error al consultar registro", "error");
    } finally {
      setBuscando(false);
    }
  };

  const agregarHeredero = () => {
    if (!tempCi || !tempPorc) return;
    const porcNum = parseInt(tempPorc);
    const totalActual = herederos.reduce((acc, curr) => acc + curr.porc, 0);

    if (totalActual + porcNum > 100) return showNotification("Supera el 100%", "error");
    
    setHerederos([...herederos, { ci: tempCi, porc: porcNum }]);
    setTempCi("");
    setTempPorc("");
  };

  const prepararTransaccion = () => {
    const total = herederos.reduce((acc, curr) => acc + curr.porc, 0);
    if (total !== 100) return showNotification("La suma debe ser exactamente 100%", "error");

    const cis = herederos.map(h => h.ci);
    const porcs = herederos.map(h => h.porc);

    // Llamada al contrato de Herencias pasando el ID de la propiedad seleccionada
    const metodo = contract.methods.definirHerencia(propiedadSeleccionada.idPropiedad, cis, porcs);
    onPrepare(metodo);
  };

  const totalPorc = herederos.reduce((acc, curr) => acc + curr.porc, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* COLUMNA IZQUIERDA: BUSCADOR (TU VISOR) */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
        <h2 className="text-lg font-black italic text-gray-800 uppercase mb-4 flex items-center gap-2">
          <span className="w-2 h-5 bg-purple-600 rounded-full"></span> 1. Selecciona el Bien
        </h2>

        <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <input 
            className="flex-1 bg-transparent outline-none text-sm font-bold px-3" 
            placeholder="CI del titular..."
            value={ciBusqueda}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && consultarBienes()}
          />
          <button 
            onClick={consultarBienes}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all"
          >
            {buscando ? "..." : "BUSCAR"}
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {listaPropiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => setPropiedadSeleccionada(p)}
              className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all ${
                propiedadSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-purple-600 border-purple-600 shadow-lg scale-[1.02]" 
                : "bg-gray-50 border-gray-100 hover:border-purple-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[9px] font-black px-2 py-1 rounded-full ${
                  propiedadSeleccionada?.idPropiedad === p.idPropiedad ? "bg-white text-purple-600" : "bg-purple-100 text-purple-600"
                }`}>
                  ID #{p.idPropiedad.toString()}
                </span>
                {p.enHerencia && <span className="text-[8px] text-amber-500 font-bold uppercase italic">Con Plan</span>}
              </div>
              <p className={`text-xs font-bold leading-tight ${propiedadSeleccionada?.idPropiedad === p.idPropiedad ? "text-white" : "text-gray-700"}`}>
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COLUMNA DERECHA: DEFINICIÓN DE PORCENTAJES */}
      <section className={`bg-white p-6 rounded-[2.5rem] shadow-xl border-t-8 border-purple-600 transition-all duration-500 ${!propiedadSeleccionada ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
        <h2 className="text-lg font-black italic text-gray-800 uppercase mb-4">2. Repartir Herencia</h2>
        
        {propiedadSeleccionada && (
          <div className="mb-4 p-3 bg-purple-50 rounded-2xl border border-purple-100">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Editando plan para:</p>
            <p className="text-sm font-bold text-purple-900 truncate">{propiedadSeleccionada.descripcion}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-gray-50 p-3 rounded-xl text-sm font-bold outline-none border border-transparent focus:border-purple-200" 
              placeholder="CI Heredero"
              value={tempCi} onChange={e => setTempCi(e.target.value)}
            />
            <input 
              className="w-16 bg-gray-50 p-3 rounded-xl text-sm font-bold text-center outline-none border border-transparent focus:border-purple-200" 
              placeholder="%"
              value={tempPorc} onChange={e => setTempPorc(e.target.value)}
            />
            <button onClick={agregarHeredero} className="bg-black text-white px-4 rounded-xl font-black">+</button>
          </div>

          <div className="space-y-2 min-h-[150px]">
            {herederos.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-500 uppercase">CI: {h.ci}</span>
                <span className="text-sm font-black text-purple-600">{h.porc}%</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-dashed">
             <span className="text-[10px] font-black text-gray-400 uppercase">Total:</span>
             <span className={`text-xl font-black ${totalPorc === 100 ? 'text-green-600' : 'text-purple-600'}`}>{totalPorc}%</span>
          </div>

          <button 
            onClick={prepararTransaccion}
            disabled={totalPorc !== 100}
            className={`w-full py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${
              totalPorc === 100 ? 'bg-purple-600 text-white hover:bg-black shadow-lg shadow-purple-100' : 'bg-gray-100 text-gray-300'
            }`}
          >
            Firmar Protocolo
          </button>
        </div>
      </section>
    </div>
  );
};

export default DefinirHerencia;