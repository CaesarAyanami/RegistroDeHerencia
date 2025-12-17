import React, { useState } from "react";

const ConsultarPlanHerencia = ({ contract, propContract, userContract, showNotification }) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [protocolo, setProtocolo] = useState([]); 
  const [cargandoProtocolo, setCargandoProtocolo] = useState(false);

  const buscarBienes = async () => {
    if (!ciDueno.trim()) return showNotification("Ingresa la CI del titular", "alert");
    setBuscandoProps(true);
    setPropSeleccionada(null);
    setProtocolo([]);
    try {
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      setPropiedades(data);
    } catch (e) {
      showNotification("Error al consultar propiedades", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const cargarDetalleHerencia = async (prop) => {
    setPropSeleccionada(prop);
    setCargandoProtocolo(true);
    try {
      const id = prop.idPropiedad;
      const cisHerederos = await contract.methods.obtenerCiConParticipacion(id).call();

      if (!cisHerederos || cisHerederos.length === 0) {
        setProtocolo([]);
        showNotification("Sin plan de herencia definido", "info");
      } else {
        // AQUÍ ESTÁ EL TRUCO: Buscamos porcentaje y nombre en paralelo
        const promesas = cisHerederos.map(async (ci) => {
          const porc = await contract.methods.obtenerParticipacion(id, ci).call();
          
          // Intentamos obtener el nombre desde el contrato de usuarios/propiedades
          // Ajusta 'obtenerNombre' al nombre real de tu función
          let nombre = "Nombre no registrado";
          try {
            if (userContract) {
              nombre = await userContract.methods.obtenerNombre(ci).call();
            }
          } catch (err) { 
            console.log("No se pudo obtener nombre para CI:", ci);
          }

          return { ci, porc, nombre };
        });

        const resultados = await Promise.all(promesas);
        setProtocolo(resultados);
      }
    } catch (e) {
      showNotification("Error al obtener el protocolo", "error");
    } finally {
      setCargandoProtocolo(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* COLUMNA IZQUIERDA: BUSCADOR */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
        <h2 className="text-lg font-black italic text-gray-800 uppercase mb-4 flex items-center gap-2">
          <span className="w-2 h-5 bg-blue-600 rounded-full"></span> 1. Buscar por Titular
        </h2>
        <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <input 
            className="flex-1 bg-transparent outline-none text-sm font-bold px-3" 
            placeholder="CI del Dueño..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
          />
          <button onClick={buscarBienes} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase">
            {buscandoProps ? "..." : "BUSCAR"}
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => cargarDetalleHerencia(p)}
              className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all ${
                propSeleccionada?.idPropiedad === p.idPropiedad ? "bg-blue-600 border-blue-600 shadow-lg scale-[1.02]" : "bg-gray-50 border-gray-100"
              }`}
            >
              <span className={`text-[9px] font-black px-2 py-1 rounded-full ${propSeleccionada?.idPropiedad === p.idPropiedad ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"}`}>
                ID #{p.idPropiedad.toString()}
              </span>
              <p className={`text-xs font-bold mt-2 ${propSeleccionada?.idPropiedad === p.idPropiedad ? "text-white" : "text-gray-700"}`}>
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COLUMNA DERECHA: PROTOCOLO CON NOMBRES */}
      <section className={`bg-white p-6 rounded-[2.5rem] shadow-xl border-t-8 border-indigo-600 transition-all ${!propSeleccionada ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
        <h2 className="text-lg font-black italic text-gray-800 uppercase mb-4">Detalle de Beneficiarios</h2>
        
        {cargandoProtocolo ? (
          <div className="py-20 text-center animate-pulse text-indigo-400 font-black text-[10px]">CONSULTANDO NOMBRES...</div>
        ) : (
          <div className="space-y-3">
            {protocolo.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                    {h.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800 leading-tight">{h.nombre}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter text-left">CI: {h.ci}</p>
                  </div>
                </div>
                <div className="bg-white px-3 py-1 rounded-xl border border-indigo-50 shadow-sm">
                  <span className="text-lg font-black text-indigo-600">{h.porc}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConsultarPlanHerencia;