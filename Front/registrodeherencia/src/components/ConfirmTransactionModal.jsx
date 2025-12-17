import React from 'react';

const ConfirmTransactionModal = ({ isOpen, onClose, onConfirm, details, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⛽
          </div>
          <h3 className="text-xl font-bold text-gray-800">Confirmar Gas</h3>
          <p className="text-sm text-gray-500">Revisa los costos estimados de la red</p>
        </div>

        {/* Detalles de la Transacción */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-4 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Costo en ETH</span>
            <span className="font-mono font-bold text-blue-700 text-lg">{details.eth} ETH</span>
          </div>
          
          <div className="h-px bg-slate-200 w-full"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades Gas</span>
            <span className="font-mono text-slate-600 font-semibold">{details.gas}</span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Confirmar y Firmar"}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Nota al pie */}
        <p className="text-[10px] text-center text-slate-400 mt-4 px-4">
          El costo real puede variar ligeramente según la congestión de la red en el momento de la firma.
        </p>
      </div>
    </div>
  );
};

export default ConfirmTransactionModal;