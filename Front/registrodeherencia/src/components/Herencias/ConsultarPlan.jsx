import React, { useState } from "react";

const ConsultaPuntualParticipacion = ({ contract, propContract, showNotification }) => {
  // Estados para el paso 1: Buscar propiedades por CI del dueño
  const [ciDueno, setCiDueno] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [buscandoProps, setBuscandoProps] = useState(false);

  // Estados para el paso 2: Consulta de participación sobre la propiedad elegida
  const [propSeleccionada, setPropSeleccionada] = useState(null);
  const [ciHeredero, setCiHeredero] = useState("");
  const [resultado, setResultado] = useState(null);
  const [consultando, setConsultando] = useState(false);

  // 1. Buscar bienes vinculados al titular
  const buscarBienesDelDuenio = async () => {
    if (!ciDueno.trim()) return showNotification("Ingresa la CI del titular", "alert");

    setBuscandoProps(true);
    setPropSeleccionada(null);
    setResultado(null);

    try {
      // Llamada al contrato de propiedades
      const data = await propContract.methods.listarPropiedadesPorCI(ciDueno.trim()).call();
      setPropiedades(data);
      if (data.length === 0) showNotification("No se encontraron bienes para esta CI", "info");
    } catch (e) {
      console.error(e);
      showNotification("Error al consultar el registro de propiedades", "error");
    } finally {
      setBuscandoProps(false);
    }
  };

  // 2. Consultar la cuota del heredero en el bien seleccionado
  const consultarCuotaEspecifica = async () => {
    if (!propSeleccionada) return showNotification("Selecciona una propiedad primero", "alert");
    if (!ciHeredero.trim()) return showNotification("Ingresa la CI del heredero", "alert");

    setConsultando(true);
    setResultado(null);

    try {
      const id = propSeleccionada.idPropiedad;
      // Llamada al contrato de herencias
      const porcentaje = await contract.methods
        .obtenerParticipacion(parseInt(id), ciHeredero.trim())
        .call();

      setResultado({
        porcentaje: porcentaje,
        ci: ciHeredero,
        id: id
      });

      if (parseInt(porcentaje) === 0) {
        showNotification("Sin asignación para este heredero", "info");
      } else {
        showNotification("Cuota verificada exitosamente", "success");
      }
    } catch (e) {
      console.error(e);
      showNotification("Error al verificar participación", "error");
    } finally {
      setConsultando(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      
      {/* SECCIÓN IZQUIERDA: LOCALIZADOR DE BIEN */}
      <section className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
        <h2 className="text-lg font-black italic text-gray-800 uppercase mb-4 flex items-center gap-2">
          <span className="w-2 h-5 bg-amber-500 rounded-full"></span> 1. Localizar Propiedad
        </h2>

        <div className="flex gap-2 mb-6 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
          <input 
            className="flex-1 bg-transparent outline-none text-sm font-bold px-3" 
            placeholder="Cédula del Dueño..."
            value={ciDueno}
            onChange={(e) => setCiDueno(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarBienesDelDuenio()}
          />
          <button 
            onClick={buscarBienesDelDuenio}
            className="bg-amber-500 hover:bg-black text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all"
          >
            {buscandoProps ? "..." : "BUSCAR"}
          </button>
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {propiedades.map((p, idx) => (
            <div 
              key={idx}
              onClick={() => { setPropSeleccionada(p); setResultado(null); }}
              className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all ${
                propSeleccionada?.idPropiedad === p.idPropiedad 
                ? "bg-amber-500 border-amber-600 shadow-lg scale-[1.02]" 
                : "bg-gray-50 border-gray-100 hover:border-amber-200"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[9px] font-black px-2 py-1 rounded-full ${
                  propSeleccionada?.idPropiedad === p.idPropiedad ? "bg-white text-amber-600" : "bg-amber-100 text-amber-600"
                }`}>
                  ID #{p.idPropiedad.toString()}
                </span>
              </div>
              <p className={`text-xs font-bold leading-tight ${propSeleccionada?.idPropiedad === p.idPropiedad ? "text-white" : "text-gray-700"}`}>
                {p.descripcion}
              </p>
            </div>
          ))}
          {propiedades.length === 0 && !buscandoProps && (
            <p className="text-center text-[10px] font-bold text-gray-400 uppercase py-10">Ingresa una CI para ver sus bienes</p>
          )}
        </div>
      </section>

      {/* SECCIÓN DERECHA: CONSULTA DE PARTICIPACIÓN */}
      <section className={`bg-white p-6 rounded-[2.5rem] shadow-xl border-t-8 border-amber-500 transition-all duration-500 ${!propSeleccionada ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
        <h2 className="text-lg font-black italic text-gray-800 uppercase mb-4 text-center">Consulta Puntual</h2>
        
        <div className="space-y-4">
          {propSeleccionada && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[8px] font-black text-amber-500 uppercase">Bien Seleccionado:</p>
              <p className="text-xs font-bold text-gray-700 truncate">{propSeleccionada.descripcion}</p>
            </div>
          )}

          <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
            <p className="text-[8px] font-black text-gray-400 uppercase px-3 pt-1">Cédula del Heredero</p>
            <input 
              className="w-full bg-transparent outline-none text-sm font-bold px-3 pb-1" 
              placeholder="Ej: V-123456"
              value={ciHeredero}
              onChange={(e) => setCiHeredero(e.target.value)}
            />
          </div>

          <button 
            onClick={consultarCuotaEspecifica}
            disabled={consultando || !propSeleccionada}
            className="w-full bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase transition-all shadow-lg hover:bg-amber-600"
          >
            {consultando ? "VERIFICANDO..." : "CONSULTAR MI PORCENTAJE"}
          </button>

          {/* Resultado Visual de la cuota */}
          {resultado && (
            <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 animate-in zoom-in-95">
              <div className="text-center">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Participación Legal</p>
                <div className="text-6xl font-black text-gray-800 leading-none mb-2">
                  {resultado.porcentaje}%
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">
                  Para {resultado.ci} en Título #{resultado.id}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ConsultaPuntualParticipacion;