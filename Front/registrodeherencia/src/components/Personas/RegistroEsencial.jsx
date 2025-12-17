import React, { useState } from "react";

const RegistroEsencial = ({ contract, account, onPrepare, showNotification }) => {
  const [form, setForm] = useState({ cedula: "", nombres: "", apellidos: "" });
  const [loading, setLoading] = useState(false);

  const validarYEnviar = async () => {
    // 1. Validaciones básicas de campos
    if (!form.cedula.trim() || !form.nombres.trim() || !form.apellidos.trim()) {
      return showNotification("Todos los campos son obligatorios", "alert");
    }

    if (!account) {
      return showNotification("Wallet no conectada", "error");
    }

    setLoading(true);

    try {
      // 2. Intento de verificación (si falla, no detenemos el proceso)
      try {
        const persona = await contract.methods.obtenerPersonaPorCI(form.cedula.trim()).call();
        // Verificamos si existe. Algunos contratos devuelven "0" otros 0 (número)
        if (persona && persona.id && persona.id.toString() !== "0") {
          setLoading(false);
          return showNotification(`La cédula ${form.cedula} ya existe`, "error");
        }
      } catch (e) {
        console.warn("No se pudo verificar la CI, procediendo con el registro...", e);
      }

      // 3. Preparación del método
      const method = contract.methods.registrarPersonaEsencial(
        form.cedula.trim(), 
        form.nombres.trim(), 
        form.apellidos.trim(), 
        account
      );

      // 4. Envío al padre
      onPrepare(method);
      
    } catch (error) {
      console.error("Error crítico:", error);
      showNotification("Error al procesar el registro", "error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium";

  return (
    <section className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xs">
          {loading ? "..." : "01"}
        </div>
        <h2 className="text-lg font-black italic text-gray-800 tracking-tight">
          Registro Esencial
        </h2>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Documento de Identidad</label>
        <input 
          placeholder="Ej: 25123456" 
          value={form.cedula}
          className={inputStyle} 
          onChange={e => setForm({...form, cedula: e.target.value})} 
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Nombres</label>
            <input 
              placeholder="Juan" 
              value={form.nombres}
              className={inputStyle} 
              onChange={e => setForm({...form, nombres: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Apellidos</label>
            <input 
              placeholder="Pérez" 
              value={form.apellidos}
              className={inputStyle} 
              onChange={e => setForm({...form, apellidos: e.target.value})} 
            />
          </div>
        </div>
      </div>

      <button 
        onClick={validarYEnviar} 
        disabled={loading}
        className={`w-full mt-2 py-4 text-white rounded-2xl font-black transition-all active:scale-[0.98] ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100"
        }`}
      >
        {loading ? "VERIFICANDO..." : "REGISTRAR EN BLOCKCHAIN"}
      </button>
    </section>
  );
};

export default RegistroEsencial;