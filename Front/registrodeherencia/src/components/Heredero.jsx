import React, { useState } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import { prepareTransaction } from "../utils/TransactionHandler";

// Subcomponentes Rediseñados
import DefinirHerencia from "./Herencias/DefinirHerencia";
import EjecutarHerencia from "./Herencias/EjecutarHerencia";
import ConsultarPlan from "./Herencias/ConsultarPlan";
import ConsultarPlanHerencia from "./Herencias/consultarDistribucion";
import ConsultarHerencia from "./Herencias/consultaHerencia";

const Herencias = () => {
  const {
    herencias: contract,
    propiedades: propContract,
    account,
    web3,
  } = useWeb3();
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
        showNotification(res.message || "Error en la transacción", "error");
      }
    } catch (err) {
      showNotification("Error crítico", "error");
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
    /* CAMBIO CLAVE: bg-[#0d0f14] asegura que el fondo sea el mismo que los componentes */
    <div className="min-h-screen bg-[#0d0f14] text-gray-300 overflow-x-hidden selection:bg-purple-500/30">
      {/* --- SECCIÓN 1: HERO & HEADER --- */}
      <div className="max-w-6xl mx-auto pt-24 pb-16 px-6">
        <header className="border-l-4 border-purple-600 pl-8 mb-24 relative">
          {/* Brillo decorativo de fondo */}
          <div className="absolute -left-20 -top-10 w-40 h-40 bg-purple-600/10 blur-[100px] pointer-events-none"></div>

          <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
            Legacy<span className="text-purple-600">.</span>
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em]">
            Protocolo de Sucesión Autónoma en Ledger
          </p>
        </header>

        {/* --- SECCIÓN 2: DEFINICIÓN (PÚRPURA) --- */}
        <section className="mb-40">
          <div className="flex items-center gap-6 mb-12">
            <span className="text-xl font-black text-white italic tracking-tighter uppercase">
              01. Configuración de Voluntad
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/50 via-purple-500/5 to-transparent"></div>
          </div>
          <div className="bg-[#0d0f14] rounded-[3.5rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden hover:border-purple-500/20 transition-all duration-700">
            <DefinirHerencia
              contract={contract}
              propContract={propContract}
              onPrepare={handlePrepare}
              showNotification={showNotification}
            />
          </div>
        </section>

        {/* --- SECCIÓN 3: EJECUCIÓN (VERDE) --- */}
        <section className="mb-40">
          <div className="flex items-center gap-6 mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-l from-green-500/50 via-green-500/5 to-transparent"></div>
            <span className="text-xl font-black text-white italic tracking-tighter uppercase">
              02. Adjudicación de Activos
            </span>
          </div>
          <div className="bg-[#0d0f14] rounded-[3.5rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden hover:border-green-500/20 transition-all duration-700">
            <EjecutarHerencia
              contract={contract}
              propContract={propContract}
              onPrepare={handlePrepare}
              showNotification={showNotification}
            />
          </div>
        </section>

        {/* --- SECCIÓN 4: AUDITORÍA --- */}
        <div className="relative py-20 border-t border-white/5">
          <div className="text-center mb-24 relative z-10">
            <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">
              Módulos de{" "}
              <span className="text-purple-600 text-outline">Auditoría</span>
            </h2>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.5em] mt-4">
              Transparencia y Verificación de Registros Inmutables
            </p>
          </div>

          <div className="grid grid-cols-1 gap-40 max-w-4xl mx-auto relative z-10">
            {/* Consulta A: Plan General */}
            <div className="group">
              <div className="flex justify-center mb-8">
                <span className="bg-[#1a1c1e] px-8 py-2 rounded-full border border-white/10 text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">
                  Localizador de Planes
                </span>
              </div>
              <div className="bg-[#0d0f14] rounded-[3.5rem] border border-white/5 shadow-2xl p-2 group-hover:border-blue-500/30 transition-all duration-500">
                <ConsultarPlan
                  contract={contract}
                  propContract={propContract}
                  showNotification={showNotification}
                />
              </div>
            </div>

            {/* Consulta B: Distribución */}
            <div className="group">
              <div className="flex justify-center mb-8">
                <span className="bg-[#1a1c1e] px-8 py-2 rounded-full border border-white/10 text-[9px] font-black text-purple-400 uppercase tracking-[0.3em]">
                  Analizador de Cuotas
                </span>
              </div>
              <div className="bg-[#0d0f14] rounded-[3.5rem] border border-white/5 shadow-2xl p-2 group-hover:border-purple-500/30 transition-all duration-500">
                <ConsultarPlanHerencia
                  contract={contract}
                  propContract={propContract}
                  showNotification={showNotification}
                />
              </div>
            </div>

            {/* Consulta C: Titularidad */}
            <div className="group pb-20">
              <div className="flex justify-center mb-8">
                <span className="bg-[#1a1c1e] px-8 py-2 rounded-full border border-white/10 text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">
                  Histórico de Propiedad
                </span>
              </div>
              <div className="bg-[#0d0f14] rounded-[3.5rem] border border-white/5 shadow-2xl p-2 group-hover:border-amber-500/30 transition-all duration-500">
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

      {/* --- FOOTER FINAL --- */}
      <footer className="bg-black py-24 border-t border-white/5 flex flex-col items-center">
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-purple-600 to-transparent mb-10"></div>
        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[1.5em] mb-4 pl-4">
          Block-Law Legacy Protocol
        </p>
        <div className="flex gap-4 opacity-30 text-[8px] font-bold text-gray-500 uppercase tracking-widest">
          <span>Nodes Active</span>
          <span>•</span>
          <span>Ledger Synced</span>
          <span>•</span>
          <span>2024-2025</span>
        </div>
      </footer>

      {/* Modales e Indicadores */}
      <ConfirmTransactionModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmarTransaccion}
        details={txDetails}
        loading={loading}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl z-[600] flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-2 border-purple-500/10 rounded-full"></div>
            <div className="absolute top-0 w-24 h-24 border-t-2 border-purple-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-white font-black text-[10px] uppercase tracking-[0.8em] animate-pulse">
            Escribiendo en Ledger...
          </p>
        </div>
      )}
    </div>
  );
};

export default Herencias;
