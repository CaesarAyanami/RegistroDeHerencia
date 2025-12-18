import React, { useState } from "react";

const RegistroEsencial = ({
  contract,
  account,
  onPrepare,
  showNotification,
}) => {
  const [form, setForm] = useState({ cedula: "", nombres: "", apellidos: "" });
  const [loading, setLoading] = useState(false);

  const validarYEnviar = async () => {
    if (!form.cedula.trim() || !form.nombres.trim() || !form.apellidos.trim()) {
      return showNotification("Todos los campos son obligatorios", "alert");
    }
    if (!account) return showNotification("Wallet no conectada", "error");

    setLoading(true);
    try {
      const method = contract.methods.registrarPersonaEsencial(
        form.cedula.trim(),
        form.nombres.trim(),
        form.apellidos.trim(),
        account
      );
      onPrepare(method);
    } catch (error) {
      showNotification("Error al procesar el registro", "error");
    } finally {
      setLoading(false);
    }
  };

  // ESTILOS DARK TECH
  const cardStyle =
    "bg-[#0d0f14] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden";
  const inputStyle =
    "w-full p-4 bg-black/40 border border-white/10 rounded-2xl outline-none text-white font-bold text-sm focus:border-blue-500/50 transition-all placeholder:text-gray-700 mb-4";
  const labelStyle =
    "text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block ml-2";

  return (
    <section className={cardStyle}>
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/40"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center font-black text-xs">
            {loading ? "..." : "01"}
          </div>
          <div>
            <h2 className="text-lg font-black italic text-white uppercase tracking-tight">
              Registro{" "}
              <span className="text-blue-500 text-outline-sm">Esencial</span>
            </h2>
            <p className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">
              New Identity Protocol
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div>
            <label className={labelStyle}>Documento de Identidad</label>
            <input
              placeholder="Ej: 25123456"
              value={form.cedula}
              className={inputStyle}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Nombres</label>
              <input
                placeholder="Juan"
                value={form.nombres}
                className={inputStyle}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
              />
            </div>
            <div>
              <label className={labelStyle}>Apellidos</label>
              <input
                placeholder="Pérez"
                value={form.apellidos}
                className={inputStyle}
                onChange={(e) =>
                  setForm({ ...form, apellidos: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <button
          onClick={validarYEnviar}
          disabled={loading}
          className={`w-full mt-4 py-5 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl ${
            loading
              ? "bg-gray-800 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
          }`}
        >
          {loading ? "VERIFICANDO DATOS..." : "REGISTRAR EN BLOCKCHAIN"}
        </button>
      </div>
    </section>
  );
};

export default RegistroEsencial;
