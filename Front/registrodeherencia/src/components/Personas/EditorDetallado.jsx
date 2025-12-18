import React, { useState, useCallback, useEffect, memo } from "react";

const EditorDetallado = memo(({ contract, account, data, onCancel, onPrepare, showNotification }) => {
  const [idBusqueda, setIdBusqueda] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isIDVerified, setIsIDVerified] = useState(false);

  const formatTimestampToDateInput = useCallback((timestampStr) => {
    const timestamp = Number(timestampStr);
    if (!timestamp || timestamp === 0) return "";
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        genero: Number(data.genero),
        fechaNacimiento: formatTimestampToDateInput(data.fechaNacimiento),
        wallet: data.wallet || account
      });
      setIsIDVerified(true);
      setIdBusqueda(data.id || "");
    }
  }, [data, account, formatTimestampToDateInput]);

  const verificarIdYPrecargar = useCallback(async () => {
    if (!contract || !idBusqueda) {
      return showNotification("Ingrese un ID válido", "warning");
    }
    
    setLoading(true);
    try {
      const result = await contract.methods.obtenerPersonaPorId(idBusqueda).call();
      
      if (result && result.nombres && result.nombres.trim() !== "") {
        setForm({
          id: idBusqueda,
          cedula: result.cedula,
          nombres: result.nombres,
          apellidos: result.apellidos,
          genero: Number(result.genero),
          fechaNacimiento: formatTimestampToDateInput(result.fechaNacimiento),
          lugarNacimiento: result.lugarNacimiento || "",
          estadoCivil: result.estadoCivil || "",
          direccion: result.direccion || "",
          telefono: result.telefono || "",
          profesion: result.profesion || "",
          wallet: result.wallet && result.wallet !== "0x0000000000000000000000000000000000000000" ? result.wallet : account
        });
        setIsIDVerified(true);
        showNotification("Datos del ciudadano cargados", "info");
      } else {
        showNotification("El ID consultado no existe en el registro", "error");
      }
    } catch (err) {
      console.error("Error al consultar ID:", err);
      showNotification("Error de conexión con la Blockchain", "error");
    } finally {
      setLoading(false);
    }
  }, [contract, idBusqueda, account, formatTimestampToDateInput, showNotification]);

  const prepararActualizacion = useCallback(() => {
    if (!form || !isIDVerified) return;

    try {
      const timestamp = form.fechaNacimiento
        ? Math.floor(new Date(form.fechaNacimiento).getTime() / 1000)
        : 0;

      if (isNaN(timestamp)) throw new Error("Fecha inválida");

      const method = contract.methods.registrarPersona(
        form.id,
        form.nombres.trim(),
        form.apellidos.trim(),
        Number(form.genero),
        timestamp,
        form.lugarNacimiento.trim(),
        form.estadoCivil.trim(),
        form.direccion.trim(),
        form.telefono.trim(),
        form.profesion.trim(),
        form.wallet
      );
      
      onPrepare(method);
    } catch (error) {
      showNotification("Error en el formato de los datos ingresados", "error");
    }
  }, [form, isIDVerified, contract, onPrepare, showNotification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4 transition-colors duration-300">
      {/* Header del editor */}
      <div className="flex items-center gap-3 mb-2 md:mb-4">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center font-bold text-xs md:text-sm border border-emerald-100 dark:border-emerald-800">
          {loading ? (
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          ) : "02"}
        </div>
        <h2 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">
          Editor de Ciudadano
        </h2>
      </div>

      {/* Sección de búsqueda por ID */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
          ID del Ciudadano a Editar
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Ej: 10"
            className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
            value={idBusqueda}
            onChange={(e) => { setIdBusqueda(e.target.value); setIsIDVerified(false); }}
          />
          <button 
            onClick={verificarIdYPrecargar} 
            disabled={loading}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "..." : "Cargar"}
          </button>
        </div>
      </div>

      {/* Formulario de edición */}
      {isIDVerified && form && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
          {/* Banner de modo edición */}
          <div className="p-3 md:p-4 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-900/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded text-xs">
                ✏️
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                MODO EDICIÓN
              </span>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                ID: {form.id}
              </span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                CI: {form.cedula}
              </span>
            </div>
          </div>

          {/* Grid de formularios responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Nombres */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Nombres
              </label>
              <input
                name="nombres"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.nombres}
                onChange={handleInputChange}
              />
            </div>

            {/* Apellidos */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Apellidos
              </label>
              <input
                name="apellidos"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.apellidos}
                onChange={handleInputChange}
              />
            </div>

            {/* Género */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Género
              </label>
              <select
                name="genero"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.genero}
                onChange={handleInputChange}
              >
                <option value={0}>Masculino</option>
                <option value={1}>Femenino</option>
                <option value={2}>Otro</option>
              </select>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Fecha de Nacimiento
              </label>
              <input
                name="fechaNacimiento"
                type="date"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.fechaNacimiento}
                onChange={handleInputChange}
              />
            </div>

            {/* Lugar de Nacimiento */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Lugar de Nacimiento
              </label>
              <input
                name="lugarNacimiento"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.lugarNacimiento}
                onChange={handleInputChange}
              />
            </div>

            {/* Estado Civil */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Estado Civil
              </label>
              <input
                name="estadoCivil"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.estadoCivil}
                onChange={handleInputChange}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Teléfono
              </label>
              <input
                name="telefono"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.telefono}
                onChange={handleInputChange}
              />
            </div>

            {/* Profesión */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Profesión
              </label>
              <input
                name="profesion"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.profesion}
                onChange={handleInputChange}
              />
            </div>

            {/* Dirección (full width en móvil, 2 cols en tablet+) */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Dirección
              </label>
              <input
                name="direccion"
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all duration-300 dark:text-gray-200"
                value={form.direccion}
                onChange={handleInputChange}
              />
            </div>

            {/* Wallet (full width, solo lectura) */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide block">
                Billetera Vinculada (Solo Lectura)
              </label>
              <input
                readOnly
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-500 font-mono cursor-not-allowed"
                value={form.wallet}
              />
            </div>
          </div>

          {/* Botón de confirmación */}
          <button
            onClick={prepararActualizacion}
            className="w-full px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none mt-2"
          >
            Confirmar y Actualizar en Blockchain
          </button>
        </div>
      )}
    </div>
  );
});

export default EditorDetallado;