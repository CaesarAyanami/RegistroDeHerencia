import React, { useState } from "react";

const RegistroPropiedad = ({ onPrepare, showNotification }) => {
  const [ci, setCi] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const ejecutarRegistro = () => {
    if (!ci || !descripcion) {
      return showNotification(
        "Completa todos los campos para registrar",
        "alert"
      );
    }
    // Lógica original intacta
    onPrepare((contract) =>
      contract.methods.registrarPropiedad(ci, descripcion)
    );
  };

  // Reutilizando tus variables de estilo exactas
  const cardStyle =
    "bg-[#0d0f14] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden";
  const inputStyle =
    "w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none text-white font-bold text-sm focus:border-blue-500/50 transition-all placeholder:text-gray-700";
  const labelStyle =
    "text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-2";

  return (
    <section className={cardStyle}>
      {/* Indicador lateral de protocolo (Igual al de tu bloque Registro) */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/40"></div>

      <div className="relative z-10">
        {/* ENCABEZADO: Siguiendo tu estructura de h3 e itálicas */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 font-black shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <span className="text-xl">+</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">
              Notariar Nuevo{" "}
              <span className="text-blue-500 text-outline">Activo</span>
            </h3>
            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.4em] mt-1">
              Asset Registration Unit
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* CAMPO CI TITULAR */}
          <div>
            <label className={labelStyle}>CI Titular del Bien</label>
            <input
              type="text"
              className={inputStyle}
              placeholder="Número de Cédula"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
            />
          </div>

          {/* CAMPO DESCRIPCIÓN */}
          <div>
            <label className={labelStyle}>
              Descripción Técnica del Inmueble
            </label>
            <textarea
              className={`${inputStyle} min-h-[120px] resize-none`}
              placeholder="Ej: Inmueble Residencial, Sector..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* BOTÓN DE ACCIÓN: Siguiendo tu estilo de 'Ejecutar Registro' */}
          <button
            onClick={ejecutarRegistro}
            className="w-full py-5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl"
          >
            Ejecutar Notaría
          </button>
        </div>
      </div>
    </section>
  );
};

export default RegistroPropiedad;
