import React, { useState } from "react";

const TransferirPropiedad = ({ onPrepare, showNotification }) => {
  const [ciActual, setCiActual] = useState("");
  const [id, setId] = useState("");
  const [ciNueva, setCiNueva] = useState("");

  const ejecutarTransferencia = () => {
    if (!id || !ciNueva || !ciActual) {
      return showNotification("Faltan datos para la transferencia", "alert");
    }

    if (ciActual.trim() === ciNueva.trim()) {
      return showNotification(
        "No puedes transferir a la misma cédula",
        "alert"
      );
    }

    try {
      // Lógica original intacta
      onPrepare((contract) =>
        contract.methods.transferirPropiedad(id, ciNueva)
      );

      showNotification("Traspaso enviado a la Blockchain", "success");

      setTimeout(() => {
        setCiActual("");
        setId("");
        setCiNueva("");
      }, 1000);
    } catch (error) {
      console.error("Error al preparar transferencia:", error);
      showNotification("Error al conectar con el contrato", "alert");
    }
  };

  // REUTILIZANDO TUS ESTILOS BASE
  const cardStyle =
    "bg-[#0d0f14] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden";
  const inputStyle =
    "w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none text-white font-bold text-sm focus:border-blue-500/50 transition-all placeholder:text-gray-700";
  const labelStyle =
    "text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-2";

  return (
    <section className={cardStyle}>
      {/* Indicador lateral de advertencia/acción (Acento en azul para consistencia) */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40"></div>

      <div className="relative z-10">
        {/* CABECERA */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <span className="text-xl">⇄</span>
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">
              Traspaso de{" "}
              <span className="text-blue-500 text-outline">Dominio</span>
            </h2>
            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.4em] mt-1">
              Asset Ownership Transfer
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* CÉDULA ORIGEN */}
          <div>
            <label className={labelStyle}>Cédula Origen (Actual)</label>
            <input
              className={inputStyle}
              placeholder="Ej: 12345678"
              value={ciActual}
              onChange={(e) => setCiActual(e.target.value)}
            />
          </div>

          {/* ID PROPIEDAD */}
          <div>
            <label className={labelStyle}>Identificador de Propiedad</label>
            <input
              type="number"
              className={`${inputStyle} border-blue-500/20`}
              placeholder="ID #"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          {/* CÉDULA DESTINO */}
          <div>
            <label className={labelStyle}>Cédula Destino (Nuevo Titular)</label>
            <input
              className={inputStyle}
              placeholder="Ej: 87654321"
              value={ciNueva}
              onChange={(e) => setCiNueva(e.target.value)}
            />
          </div>

          {/* BOTÓN DE EJECUCIÓN (Estilo blanco como tu registro civil) */}
          <button
            onClick={ejecutarTransferencia}
            className="w-full mt-4 py-5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl"
          >
            Ejecutar Traspaso
          </button>
        </div>
      </div>
    </section>
  );
};

export default TransferirPropiedad;
