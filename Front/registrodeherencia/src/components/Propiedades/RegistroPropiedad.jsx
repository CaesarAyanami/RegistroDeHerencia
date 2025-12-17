import React, { useState } from "react";

const RegistroPropiedad = ({ onPrepare, showNotification }) => {
  const [ci, setCi] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const ejecutarRegistro = () => {
    if (!ci || !descripcion) {
      return showNotification("Completa todos los campos para registrar", "alert");
    }
    // Preparamos el método del contrato para el componente padre
    onPrepare(contract => contract.methods.registrarPropiedad(ci, descripcion));
  };

  return (
    <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 -z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 font-black">
            +
          </div>
          <h2 className="text-xl font-black italic text-gray-800 tracking-tight uppercase">Registrar Activo</h2>
        </div>

        <div className="space-y-4">
          <div className="group">
            <label className="text-[10px] font-black text-blue-400 ml-2 uppercase tracking-[0.2em]">CI Titular</label>
            <input 
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none p-4 rounded-2xl font-bold text-gray-600 transition-all shadow-sm"
              placeholder="Ej: 12345678"
              value={ci}
              onChange={e => setCi(e.target.value)}
            />
          </div>

          <div className="group">
            <label className="text-[10px] font-black text-blue-400 ml-2 uppercase tracking-[0.2em]">Descripción del Inmueble</label>
            <textarea 
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none p-4 rounded-2xl font-bold text-gray-600 transition-all shadow-sm min-h-[100px]"
              placeholder="Ej: Casa Residencial, Av. 5 de Julio..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </div>

          <button 
            onClick={ejecutarRegistro}
            className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            NOTARIAR PROPIEDAD
          </button>
        </div>
      </div>
    </section>
  );
};

export default RegistroPropiedad;