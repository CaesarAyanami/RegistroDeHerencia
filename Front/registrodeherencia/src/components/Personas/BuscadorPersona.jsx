import React, { useState } from "react";

const ConsultarPlanHerencia = ({ contract, propContract, personaContract, showNotification }) => {
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [protocolo, setProtocolo] = useState([]); 
  const [cargandoProtocolo, setCargandoProtocolo] = useState(false);

  const buscarBienes = async () => {
    if (!ciDueno.trim()) return showNotification("Ingresa la CI del titular", "alert");
    setPropSeleccionada();
    setCargandoProtocolo(true);
    setProtocolo([]);



    try {
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      setPropiedades(data);
      if (data.length === 0) showNotification("No se encontraron bienes", "info");
    } catch (e) {
      showNotification("Error al consultar propiedades", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  const cargarDetalleHerencia = async (prop) => {
    setPropSeleccionada(prop);
    setCargandoProtocolo(true);
    setProtocolo([]);

    try {
      const id = prop.idPropiedad;
      const cisHerederos = await contract.methods.obtenerCiConParticipacion(id).call();

      if (!cisHerederos || cisHerederos.length === 0) {
        showNotification("Sin plan de herencia", "info");
      } else {
        // MAPEO CON DATOS DE CONTRATO PERSONA
        const promesas = cisHerederos.map(async (ci) => {
          // 1. Traemos el porcentaje del contrato de Herencia
          const porc = await contract.methods.obtenerParticipacion(id, ci).call();
          
          // 2. Traemos los datos del contrato Persona (tu lógica del Buscador)
          let datosPersona = { nombres: "No registrado", apellidos: "" };
          try {
            const p = await personaContract.methods.obtenerPersonaPorCI(ci).call();
            if (p && p.nombres !== "") {
              datosPersona = p;
            }
          } catch (err) {
            console.error("Persona no encontrada en blockchain para CI:", ci);
          }

          return { 
            ci, 
            porc, 
            nombreCompleto: `${datosPersona.nombres} ${datosPersona.apellidos}`,
            genero: datosPersona.genero // Opcional por si quieres poner el emoji 👨/👩
          };
        });

        const resultados = await Promise.all(promesas);
        setProtocolo(resultados);
      }
    } catch (e) {
      showNotification("Error en protocolo", "error");
    } finally {
      setCargandoProtocolo(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
      
      {/* SECCIÓN IZQUIERDA: BUSCADOR DE BIENES */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
        <h2 className="text-xl font-black italic text-gray-800 uppercase mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-600 rounded-full"></span> 1. Titular de Bienes
        </h2>

        <div className="flex gap-2 mb-8 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-indigo-300 transition-all">
          <input 
            className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-600 px-4" 
            placeholder="Cédula del Dueño..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarBienes()}
          />
          <button 
            onClick={buscarBienes}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100"
          >
            {buscandoProps ? "..." : "BUSCAR"}
          </button>
        </div>

        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => cargarDetalleHerencia(p)}
              className={`p-5 rounded-[1.8rem] border-2 cursor-pointer transition-all ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-indigo-600 border-indigo-600 shadow-xl scale-[1.02]" 
                : "bg-white border-gray-50 hover:border-indigo-100"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className={`text-sm font-black leading-tight ${propSeleccionada?.idPropiedad === p.idPropiedad ? "text-white" : "text-gray-800"}`}>
                  {p.descripcion}
                </p>
                <span className={`text-[8px] font-black px-2 py-1 rounded-lg ${
                  propSeleccionada?.idPropiedad === p.idPropiedad ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                }`}>
                  #{p.idPropiedad.toString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN DERECHA: PROTOCOLO CON NOMBRES DE PERSONA */}
      <section className={`bg-white p-6 rounded-[2.5rem] shadow-xl border-t-8 border-indigo-600 transition-all duration-500 ${!propSeleccionada ? 'opacity-40 grayscale pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
        <h2 className="text-xl font-black italic text-gray-800 uppercase mb-6 text-center">Protocolo de Herederos</h2>
        
        {cargandoProtocolo ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black text-indigo-400 animate-pulse uppercase tracking-[0.2em]">Consultando Registro Civil...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {protocolo.map((h, i) => (
              <div key={i} className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-inner border border-indigo-50 flex items-center justify-center text-xl">
                    {Number(h.genero) === 0 ? "👨" : Number(h.genero) === 1 ? "👩" : "👤"}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase italic leading-none mb-1">{h.nombreCompleto}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">CI: {h.ci}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-600 leading-none">{h.porc}%</div>
                  <p className="text-[8px] font-black text-indigo-300 uppercase mt-1">Participación</p>
                </div>
              </div>
            ))}

            {protocolo.length === 0 && propSeleccionada && (
              <div className="text-center py-20 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest leading-loose">No se ha definido una <br/> distribución para este bien</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConsultarPlanHerencia;