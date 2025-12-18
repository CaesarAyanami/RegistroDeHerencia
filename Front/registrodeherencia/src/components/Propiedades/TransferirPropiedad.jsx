import React, { useState } from "react";

const TransferirPropiedad = ({ onPrepare, showNotification }) => {
  const [ciActual, setCiActual] = useState("");
  const [id, setId] = useState("");
  const [ciNueva, setCiNueva] = useState("");

  const ejecutarTransferencia = () => {
    if (!id || !ciNueva || !ciActual) {
      return showNotification("Debes completar los 3 campos: CI Origen, ID y CI Destino", "alert");
    }

    if (ciActual.trim() === ciNueva.trim()) {
      return showNotification("La cédula de origen y destino no pueden ser iguales", "alert");
    }

    try {
      onPrepare((contract) => 
        contract.methods.transferirPropiedad(
          id, 
          ciActual.trim(), 
          ciNueva.trim()
        )
      );

      showNotification("Preparando confirmación de traspaso...", "info");

    } catch (error) {
      console.error("Error al preparar transferencia:", error);
      showNotification("Error al construir la transacción", "error");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 transition-colors duration-300">
      {/* Header del componente */}
      <div className="flex items-center gap-3 mb-2 md:mb-4">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-md flex items-center justify-center font-bold text-xs md:text-sm border border-amber-100 dark:border-amber-800">
          ⇄
        </div>
        <h2 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">
          Transferencia de Activo
        </h2>
      </div>

      <div className="space-y-3 md:space-y-4">
        {/* Campo: CI Propietario Actual */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            Cédula Propietario Actual
          </label>
          <input 
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Cédula registrada en el título"
            value={ciActual}
            onChange={e => setCiActual(e.target.value)}
          />
        </div>

        {/* Campo: ID de Propiedad */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            ID de Propiedad
          </label>
          <input 
            type="number"
            className="w-full px-3 py-2 text-xs border border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/20 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all duration-300 text-amber-700 dark:text-amber-400 font-bold placeholder:text-amber-400/50 dark:placeholder:text-amber-600"
            placeholder="Ej: 1"
            value={id}
            onChange={e => setId(e.target.value)}
          />
        </div>

        {/* Campo: CI Nuevo Dueño */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            Cédula Nuevo Dueño
          </label>
          <input 
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            placeholder="Cédula del nuevo adquirente"
            value={ciNueva}
            onChange={e => setCiNueva(e.target.value)}
          />
        </div>
        
        {/* Botón de acción */}
        <button 
          onClick={ejecutarTransferencia}
          className="w-full px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:ring-2 focus:ring-amber-400 focus:outline-none mt-2 shadow-sm"
        >
          NOTARIAR TRASPASO
        </button>

        {/* Información adicional */}
        <div className="pt-2">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed px-2">
            Al ejecutar, se solicitará firma digital para validar el cambio de titularidad en el registro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransferirPropiedad;