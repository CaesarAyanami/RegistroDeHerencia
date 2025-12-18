import React, { useState, useCallback, useMemo } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import { prepareTransaction } from "../utils/TransactionHandler";

// Subcomponentes
import RegistroEsencial from "./Personas/RegistroEsencial";
import BuscadorPersona from "./Personas/BuscadorPersona";
import EditorDetallado from "./Personas/EditorDetallado";

const Personas = () => {
  const { personas: contract, account, web3 } = useWeb3();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txDetails, setTxDetails] = useState({ gas: 0, eth: 0, method: null });
  const [datosEdicion, setDatosEdicion] = useState(null);

  const handlePrepare = useCallback(async (method) => {
    if (!web3 || !account) {
      showNotification("Conecta tu billetera para continuar", "warning");
      return;
    }

    try {
      const res = await prepareTransaction(web3, method, account);
      if (res && res.success) {
        setTxDetails(res);
        setShowConfirm(true);
      } else {
        showNotification(res?.error || "Error al calcular gas. Verifica tus fondos.", "error");
      }
    } catch (err) {
      console.error("Prepare Error:", err);
      showNotification("Fallo crítico al preparar la transacción", "error");
    }
  }, [web3, account, showNotification]);

  const confirmarTransaccion = useCallback(async () => {
    if (!txDetails.method) return;

    setShowConfirm(false);
    setLoading(true);
    try {
      const recipe = await txDetails.method.send({ from: account });
      
      if (recipe.status) {
        showNotification("Registro actualizado en la Blockchain con éxito", "success");
        setDatosEdicion(null); 
      }
    } catch (err) {
      console.error("TX Error:", err);
      const msg = err.code === 4001 ? "Transacción cancelada por el usuario" : "La transacción falló en la red";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [txDetails, account, showNotification]);

  const handleSelectEdit = useCallback((data) => {
    setDatosEdicion(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 transition-colors duration-300">
      
      <ConfirmTransactionModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmarTransaccion}
        details={txDetails}
        loading={loading}
      />

      {loading && (
        <div className="fixed inset-0 w-full h-full bg-white/80 dark:bg-gray-900/90 backdrop-blur-md z-[9999] flex flex-col items-center justify-center transition-colors">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4 md:mb-6 shadow-xl shadow-emerald-200/50"></div>
          <p className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-100 tracking-tight animate-pulse px-4 text-center">
            Firmando Transacción en Blockchain...
          </p>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Por favor, confirma en tu Wallet</p>
        </div>
      )}

      {/* Header del Módulo */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 transition-all duration-300">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Registro de Títulos Digitales
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] line-clamp-1">
              Sistema de Tokenización de Activos Reales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 md:px-5 md:py-3 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-sm transition-colors mt-4 md:mt-0">
          <span className="text-lg md:text-xl">🏠</span>
          <div className="text-left">
            <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase leading-none mb-0.5 md:mb-1">
              Estatus del Registro
            </p>
            <p className="text-xs font-black text-white uppercase tracking-wider md:tracking-widest">
              Inscripción Abierta
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* LADO IZQUIERDO: Formularios - En móvil ocupa 12, en escritorio 5 */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <section className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300">
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/30 dark:bg-emerald-900/20 flex items-center gap-2">
              <span className="p-1 md:p-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded text-xs md:rounded-md">
                📝
              </span>
              <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider truncate">
                Registro Esencial
              </h2>
            </div>
            <div className="p-3 md:p-4">
              <RegistroEsencial
                contract={contract}
                account={account}
                onPrepare={handlePrepare}
                showNotification={showNotification}
              />
            </div>
          </section>

          <section className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border transition-all duration-300 ${
            datosEdicion 
              ? 'border-emerald-500/50 dark:border-emerald-400/50 shadow-sm ring-1 ring-emerald-500/20 dark:ring-emerald-400/20' 
              : 'border-gray-100 dark:border-gray-700 shadow-sm'
          }`}>
            <div className={`p-3 md:p-4 border-b ${
              datosEdicion 
                ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/20' 
                : 'border-gray-100 dark:border-gray-700'
            } flex items-center justify-between transition-colors`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`p-1 md:p-1.5 rounded text-xs md:rounded-md ${
                  datosEdicion 
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  ✏️
                </span>
                <h2 className="text-xs font-black uppercase tracking-wider truncate">
                  <span className={datosEdicion ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}>
                    Editor Detallado
                  </span>
                  {datosEdicion && (
                    <span className="ml-1 md:ml-2 text-[10px] font-bold text-emerald-500 dark:text-emerald-400 hidden sm:inline">
                      • MODO EDICIÓN
                    </span>
                  )}
                </h2>
              </div>
              {datosEdicion && (
                <button 
                  onClick={() => setDatosEdicion(null)}
                  className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 text-xl font-bold transition-colors flex-shrink-0"
                >
                  &times;
                </button>
              )}
            </div>
            <div className="p-3 md:p-4">
              <EditorDetallado
                contract={contract}
                account={account}
                data={datosEdicion}
                onCancel={() => setDatosEdicion(null)}
                onPrepare={handlePrepare}
                showNotification={showNotification}
              />
            </div>
          </section>
        </div>

        {/* LADO DERECHO: Buscador - En móvil ocupa 12, en escritorio 7 */}
        <div className="lg:col-span-7">
          <section className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300">
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/30 dark:bg-emerald-900/20 flex items-center gap-2">
              <span className="p-1 md:p-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded text-xs md:rounded-md">
                🔍
              </span>
              <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider truncate">
                Explorador de Personas
              </h2>
            </div>
            <div className="p-3 md:p-4">
              <BuscadorPersona
                contract={contract}
                onEdit={handleSelectEdit}
                showNotification={showNotification}
              />
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default Personas;