import React, { useState, useCallback, memo } from "react";

const RegistroEsencial = memo(({ contract, account, onPrepare, showNotification }) => {
  const [form, setForm] = useState({ cedula: "", nombres: "", apellidos: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const validarYEnviar = async () => {
    const cedulaClean = form.cedula.trim();
    const nombresClean = form.nombres.trim();
    const apellidosClean = form.apellidos.trim();

    if (!cedulaClean || !nombresClean || !apellidosClean) {
      return showNotification("Todos los campos son obligatorios", "alert");
    }

    if (!account || !contract) {
      return showNotification("Error de conexión: Wallet o Contrato no detectado", "error");
    }

    setLoading(true);

    try {
      try {
        const persona = await contract.methods.obtenerPersonaPorCI(cedulaClean).call();
        if (persona && persona.id && persona.id.toString() !== "0") {
          showNotification(`Conflicto: La cédula ${cedulaClean} ya está registrada`, "error");
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Validación de CI omitida por error de red", e);
      }

      const method = contract.methods.registrarPersonaEsencial(
        cedulaClean, 
        nombresClean, 
        apellidosClean, 
        account
      );

      onPrepare(method);
      setForm({ cedula: "", nombres: "", apellidos: "" });

    } catch (error) {
      console.error("Error en flujo de RegistroEsencial:", error);
      showNotification("Error interno al procesar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 transition-colors duration-300">
      {/* Header del componente */}
      <div className="flex items-center gap-3 mb-2 md:mb-4">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center font-bold text-xs md:text-sm border border-emerald-100 dark:border-emerald-800">
          {loading ? (
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          ) : "01"}
        </div>
        <h2 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">
          Registro Esencial
        </h2>
      </div>

      <div className="space-y-3 md:space-y-4">
        {/* Campo Cédula */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
            Documento de Identidad
          </label>
          <input 
            name="cedula"
            type="text"
            placeholder="Ej: 25123456" 
            value={form.cedula}
            className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            onChange={handleInputChange}
          />
        </div>
        
        {/* Grid de Nombres y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
              Nombres
            </label>
            <input 
              name="nombres"
              type="text"
              placeholder="Juan" 
              value={form.nombres}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
              Apellidos
            </label>
            <input 
              name="apellidos"
              type="text"
              placeholder="Pérez" 
              value={form.apellidos}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Botón de registro */}
      <button 
        onClick={validarYEnviar} 
        disabled={loading}
        className={`w-full px-3 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none mt-4 md:mt-6 ${
          loading 
            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 cursor-not-allowed" 
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px]">Verificando datos...</span>
          </div>
        ) : (
          "Registrar en Blockchain"
        )}
      </button>

      {/* Información adicional */}
      <div className="pt-2">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
          Solo se registran datos esenciales. El resto puede completarse en el editor.
        </p>
      </div>
    </div>
  );
});

export default RegistroEsencial;