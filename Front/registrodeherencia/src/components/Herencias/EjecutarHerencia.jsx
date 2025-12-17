import React, { useState } from "react";

const EjecutarHerencia = ({ contract, propContract, onPrepare, showNotification }) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [ciHeredero, setCiHeredero] = useState("");

  const buscarBienes = async () => {
    if (!propContract) return showNotification("Contrato Propiedades no detectado", "error");
    if (!ciDueno.trim()) return showNotification("Ingrese CI del titular fallecido", "alert");

    setBuscandoProps(true);
    setPropiedades([]);
    setPropSeleccionada(null);

    try {
      // Usamos listarPropiedadesPorCI del nuevo Propiedades.sol
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      
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
    if (!propSeleccionada) return showNotification("Seleccione un bien de la lista", "alert");
    if (!ciHeredero.trim()) return showNotification("Ingrese la CI del heredero", "alert");

    try {
      const id = propSeleccionada.idPropiedad;

      // VALIDACIÓN PREVIA EN EL CONTRATO DE HERENCIAS
      const plan = await contract.methods.obtenerHerencia(id).call();
      
      if (!plan || plan.length === 0) {
        return showNotification("Este bien no tiene un plan de herencia definido", "error");
      }

      // Preparamos el método ejecutarHerencia(uint256, string)
      // Nota: El contrato Herencias.sol se encarga de obtener el CI anterior 
      // y enviarlo a Propiedades.sol automáticamente.
      const metodo = contract.methods.ejecutarHerencia(id, ciHeredero.trim());

      onPrepare(metodo);
      
    } catch (err) {
      // Evitamos el pantallazo blanco capturando el error como texto
      console.error(err);
      const errorMsg = err.message || "Error desconocido";
      showNotification(errorMsg.includes("revert") ? "La Blockchain rechazó la ejecución" : "Error de comunicación", "error");
    }
  };

  return (
    <section className="bg-[#1e2124] text-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-700">
      <h2 className="text-xl font-black italic uppercase mb-6 flex items-center gap-3 text-green-400">
        <span className="w-2 h-6 bg-green-500 rounded-full shadow-[0_0_12px_#22c55e]"></span> 
        Adjudicación Legal
      </h2>

      {/* PASO 1: Búsqueda por CI */}
      <div className="bg-[#2f3336] p-5 rounded-3xl border border-gray-600 mb-6">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block ml-1">
          1. Identificar Bienes del Causante
        </label>
        <div className="flex gap-3">
          <input 
            className="flex-1 bg-[#121416] border border-gray-700 outline-none text-sm font-bold px-5 py-3 rounded-2xl text-white focus:border-green-500 transition-all placeholder:text-gray-600" 
            placeholder="Cédula del Titular..." 
            value={ciDueno} 
            onChange={(e) => setCiDueno(e.target.value)}
          />
          <button 
            onClick={buscarBienes}
            disabled={buscandoProps}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {buscandoProps ? "..." : "BUSCAR"}
          </button>
        </div>
      </div>

      {/* LISTADO DE RESULTADOS - ALTO CONTRASTE */}
      <div className={`space-y-3 mb-6 transition-all duration-300 ${propiedades.length > 0 ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {propiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => setPropSeleccionada(p)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-green-600/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]" 
                : "bg-[#121416] border-transparent hover:border-gray-600"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-green-500">ACTIVO #{p.idPropiedad.toString()}</span>
                {p.enHerencia && <span className="text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase font-bold">Plan Activo</span>}
              </div>
              <p className="text-sm font-bold text-gray-200">{p.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PASO 2: EJECUCIÓN */}
      <div className={`space-y-4 transition-all duration-500 ${!propSeleccionada ? 'opacity-10 grayscale pointer-events-none' : 'opacity-100'}`}>
        <div className="bg-[#2f3336] p-5 rounded-3xl border border-gray-600">
          <label className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-3 block ml-1">
            2. CI del Nuevo Propietario
          </label>
          <input 
            className="w-full bg-[#121416] border border-gray-700 outline-none text-sm font-bold text-white px-5 py-4 rounded-2xl focus:border-green-500 transition-all placeholder:text-gray-600" 
            placeholder="Ingrese Cédula del Heredero..." 
            value={ciHeredero} 
            onChange={(e) => setCiHeredero(e.target.value)}
          />
        </div>

        <button 
          onClick={prepararTransaccion}
          className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black text-[12px] uppercase hover:bg-green-500 hover:text-white transition-all shadow-xl active:scale-95"
        >
          Firmar Traspaso de Título
        </button>
      </div>
    </section>
  );
};

export default EjecutarHerencia;