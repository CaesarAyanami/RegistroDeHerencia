import React, { useState, useCallback, memo } from "react";
import { useWeb3 } from '../Loader/MetamaskLoader';

const RegistroPropiedad = memo(({ onPrepare, showNotification }) => {
  const { personas: contractPersonas } = useWeb3();
  const [form, setForm] = useState({ ci: "", descripcion: "" });
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const ejecutarRegistro = async () => {
    const ciClean = form.ci.trim();
    const descClean = form.descripcion.trim();

    if (!ciClean || !descClean) {
      return showNotification("Completa todos los campos obligatorios", "alert");
    }

    if (!contractPersonas) {
      return showNotification("Error de conexión: Contrato de Personas no detectado", "error");
    }

    setIsValidating(true);

    try {
      let personaExiste = false;
      
      try {
        const persona = await contractPersonas.methods.obtenerPersonaPorCI(ciClean).call();
        
        if (persona && persona.nombres && persona.nombres.trim() !== "" && persona.id !== "0") {
          personaExiste = true;
        }
      } catch (err) {
        console.error("Error al consultar persona:", err);
      }

      if (!personaExiste) {
        setIsValidating(false);
        return showNotification(`Usuario inexistente: La CI ${ciClean} no está registrada en el sistema de ciudadanos.`, "error");
      }

      onPrepare(contract => 
        contract.methods.registrarPropiedad(ciClean, descClean)
      );

      setForm({ ci: "", descripcion: "" });

    } catch (error) {
      console.error("Error crítico en el proceso:", error);
      showNotification("Ocurrió un error inesperado al procesar el registro", "error");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 transition-colors duration-300">
      {/* Header del componente */}
      <div className="flex items-center gap-3 mb-2 md:mb-4">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center font-bold text-xs md:text-sm border border-emerald-100 dark:border-emerald-800">
          {isValidating ? (
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          ) : "+"}
        </div>
        <h2 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">
          Registrar Activo
        </h2>
      </div>

      <div className="space-y-3 md:space-y-4">
        {/* Campo CI */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            CI Titular (Debe estar registrado)
          </label>
          <input 
            name="ci"
            type="text"
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
              isValidating 
                ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-not-allowed' 
                : 'border-gray-200 dark:border-gray-600 dark:bg-gray-700'
            }`}
            placeholder="Ej: 25000111"
            value={form.ci}
            onChange={handleChange}
            disabled={isValidating}
          />
        </div>

        {/* Campo Descripción */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            Descripción Técnica del Inmueble
          </label>
          <textarea 
            name="descripcion"
            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none min-h-[80px] md:min-h-[100px] ${
              isValidating 
                ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-not-allowed' 
                : 'border-gray-200 dark:border-gray-600 dark:bg-gray-700'
            }`}
            placeholder="Indique dirección completa y detalles del inmueble..."
            value={form.descripcion}
            onChange={handleChange}
            disabled={isValidating}
            rows={4}
          />
        </div>

        {/* Botón de acción */}
        <button 
          onClick={ejecutarRegistro}
          disabled={isValidating}
          className={`w-full px-3 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none mt-2 ${
            isValidating 
              ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          }`}
        >
          {isValidating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[11px]">VERIFICANDO EN LEDGER...</span>
            </div>
          ) : "CERTIFICAR PROPIEDAD"}
        </button>

        {/* Información adicional */}
        <div className="pt-2">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center italic">
            El titular debe estar previamente registrado en el sistema de personas
          </p>
        </div>
      </div>
    </div>
  );
});

export default RegistroPropiedad;