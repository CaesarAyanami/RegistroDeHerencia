import React, { useState } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import { prepareTransaction } from "../utils/TransactionHandler";

// Subcomponentes
import DefinirHerencia from "./Herencias/DefinirHerencia";
import EjecutarHerencia from "./Herencias/EjecutarHerencia";
import ConsultarPlan from "./Herencias/ConsultarPlan";
import ConsultarPlanHerencia from "./Herencias/consultarDistribucion";
import ConsultarHerencia from "./Herencias/consultaHerencia";

const Herencias = () => {
  const { herencias: contract, propiedades: propContract, account, web3 } = useWeb3();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txDetails, setTxDetails] = useState({ gas: 0, eth: 0, method: null });

  const handlePrepare = async (method) => {
    try {
      const res = await prepareTransaction(web3, method, account);
      if (res.success) {
        setTxDetails(res);
        setShowConfirm(true);
      } else {
        showNotification(res.message || "La transacción fallará.", "error");
      }
    } catch (err) {
      showNotification("Error crítico al preparar la transacción", "error");
    }
  };

  const confirmarTransaccion = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await txDetails.method.send({ from: account });
      showNotification("Operación procesada con éxito", "success");
    } catch (err) {
      showNotification("La transacción falló en la red", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 transition-colors duration-300 pb-8 md:pb-12">
      <ConfirmTransactionModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmarTransaccion}
        details={txDetails}
        loading={loading}
      />

      {/* Pantalla de Carga */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md z-[1000] flex flex-col items-center justify-center transition-colors">
          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mb-3 md:mb-4"></div>
          <p className="text-gray-800 dark:text-gray-200 font-bold tracking-tight uppercase text-xs animate-pulse px-4 text-center">
            Sincronizando con Ethereum...
          </p>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 transition-all duration-300">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Gestión de Herencia Digital
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] line-clamp-1">
              Protocolo de Sucesión Autónoma
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 md:px-5 md:py-3 bg-gray-900 dark:bg-gray-700 rounded-lg shadow-sm transition-colors mt-4 md:mt-0">
          <span className="text-lg md:text-xl">⚖️</span>
          <div className="text-left">
            <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase leading-none mb-0.5 md:mb-1">
              Estatus del Sistema
            </p>
            <p className="text-xs font-black text-white uppercase tracking-wider md:tracking-widest">
              Nodo Legal Activo
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: OPERACIONES PRINCIPALES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
        
        {/* Lado Izquierdo: Configuración de Protocolo */}
        <div className="lg:col-span-8">
          <section className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/30 dark:bg-indigo-900/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md text-xs">
                  ⚙️
                </span>
                <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Configuración de Protocolo
                </h2>
              </div>
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 italic uppercase">
                Paso 1: Definir Distribución
              </span>
            </div>
            <div className="p-3 md:p-4 flex-1">
              <DefinirHerencia
                contract={contract}
                propContract={propContract}
                account={account}
                onPrepare={handlePrepare}
                showNotification={showNotification}
              />
            </div>
          </section>
        </div>

        {/* Lado Derecho: Ejecución Inmediata */}
        <div className="lg:col-span-4">
          <section className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-sm transition-all duration-300">
            <div className="p-4 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-md text-xs">
                  ⚡
                </span>
                <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Acción Legal Inmediata
                </h2>
              </div>
            </div>
            <div className="p-3 md:p-4 flex-1">
              <EjecutarHerencia
                contract={contract}
                propContract={propContract}
                onPrepare={handlePrepare}
                showNotification={showNotification}
              />
            </div>
          </section>
        </div>
      </div>

      {/* SECCIÓN 2: HERRAMIENTAS DE AUDITORÍA */}
      <div className="space-y-4 md:space-y-6">
        {/* Separador */}
        <div className="flex items-center gap-3 md:gap-4">
          <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider md:tracking-[0.3em] whitespace-nowrap shrink-0">
            Herramientas de Auditoría
          </h3>
          <div className="h-[1px] bg-gray-200 dark:bg-gray-700 w-full"></div>
        </div>

        {/* Grid de herramientas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Consultar Plan */}
          <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/30 dark:bg-indigo-900/20">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md text-xs">
                  🔍
                </span>
                <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Consultar Plan
                </h2>
              </div>
            </div>
            <div className="p-3 md:p-4 flex-1">
              <ConsultarPlan
                contract={contract}
                propContract={propContract}
                showNotification={showNotification}
              />
            </div>
          </div>
          
          {/* Consultar Distribución */}
          <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-amber-50/30 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-md text-xs">
                  📊
                </span>
                <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Distribución
                </h2>
              </div>
            </div>
            <div className="p-3 md:p-4 flex-1">
              <ConsultarPlanHerencia
                contract={contract}
                propContract={propContract}
                showNotification={showNotification}
              />
            </div>
          </div>

          {/* Consultar Herencia */}
          <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/30 dark:bg-emerald-900/20">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-md text-xs">
                  📋
                </span>
                <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Estado de Herencia
                </h2>
              </div>
            </div>
            <div className="p-3 md:p-4 flex-1">
              <ConsultarHerencia
                contract={contract}
                propContract={propContract}
                showNotification={showNotification}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Herencias;