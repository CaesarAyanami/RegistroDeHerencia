import React from 'react';

const ConfirmTransactionModal = ({ isOpen, onClose, onConfirm, details, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200 transition-all">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl p-6 shadow-xl scale-100 animate-in zoom-in-95 duration-200 transition-colors duration-300">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-xl md:text-2xl">
            ⛽
          </div>
          <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
            Confirmar Transacción
          </h3>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Revisa los costos estimados de la red
          </p>
        </div>

        {/* Detalles de la Transacción */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 space-y-4 border border-gray-100 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Costo en ETH
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base md:text-lg">
              {details.eth} ETH
            </span>
          </div>
          
          <div className="h-px bg-gray-200 dark:bg-gray-600 w-full"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Unidades de Gas
            </span>
            <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">
              {details.gas}
            </span>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full px-3 py-3 md:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 disabled:bg-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-sm"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px]">PROCESANDO...</span>
              </div>
            ) : "CONFIRMAR Y FIRMAR"}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full px-3 py-2 text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 disabled:opacity-50"
          >
            CANCELAR
          </button>
        </div>

        {/* Nota al pie */}
        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 px-2">
            El costo real puede variar ligeramente según la congestión de la red en el momento de la firma.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTransactionModal;