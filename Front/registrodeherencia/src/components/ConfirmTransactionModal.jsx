import React from "react";

const ConfirmTransactionModal = ({
  isOpen,
  onClose,
  onConfirm,
  details,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[600] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Contenedor Principal Dark */}
      <div className="bg-[#0d0f14] w-full max-w-sm rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Glow Decorativo de fondo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[60px] pointer-events-none"></div>

        {/* Encabezado Tech */}
        <div className="text-center mb-8 relative">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 text-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
            <span className="text-3xl animate-pulse">⛽</span>
          </div>
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Validar <span className="text-purple-500 text-outline">Gas</span>
          </h3>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-2">
            Estimación de Recursos de Red
          </p>
        </div>

        {/* Detalles de la Transacción (Estilo Ledger) */}
        <div className="bg-black/40 rounded-3xl p-6 mb-8 space-y-6 border border-white/5 relative">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1">
                Costo Estimado
              </span>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">
                Blockchain Fee
              </span>
            </div>
            <span className="font-black text-white text-xl tracking-tight italic">
              {details.eth} <span className="text-xs text-purple-600">ETH</span>
            </span>
          </div>

          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"></div>

          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
              Unidades Gas
            </span>
            <span className="font-mono text-gray-400 font-bold text-xs bg-white/5 px-3 py-1 rounded-lg border border-white/5">
              {details.gas}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-4 relative">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="group relative w-full py-5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 group-hover:text-white transition-colors">
              {loading ? "Sincronizando..." : "Autorizar Firma"}
            </span>
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 text-gray-600 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-colors disabled:opacity-0"
          >
            Abortar Operación
          </button>
        </div>

        {/* Nota de Seguridad */}
        <div className="mt-8 flex gap-3 items-start opacity-40">
          <div className="w-1 h-8 bg-purple-600 rounded-full"></div>
          <p className="text-[8px] text-left text-gray-400 font-bold uppercase leading-relaxed tracking-wider">
            El valor final se ajustará automáticamente según el tráfico del nodo
            en el momento de la ejecución.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTransactionModal;
