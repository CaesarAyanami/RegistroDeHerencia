import React, { useState } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import { prepareTransaction } from "../utils/TransactionHandler";

import RegistroPropiedad from "./Propiedades/RegistroPropiedad";
import TransferirPropiedad from "./Propiedades/TransferirPropiedad";
import VisorPropiedades from "./Propiedades/VisorPropiedades";

const Propiedades = () => {
  const { propiedades: contract, account, web3 } = useWeb3();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txDetails, setTxDetails] = useState({ gas: 0, eth: 0, method: null });

  const handlePrepare = async (methodFactory) => {
    try {
      const method = methodFactory(contract);
      const res = await prepareTransaction(web3, method, account);
      if (res.success) {
        setTxDetails(res);
        setShowConfirm(true);
      } else {
        showNotification(res.error, "error");
      }
    } catch (err) {
      showNotification("Error al preparar transacción", "error");
    }
  };

  const confirmarTransaccion = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await txDetails.method.send({ from: account });
      showNotification("Registro Blockchain Exitoso", "success");
    } catch (err) {
      showNotification("Transacción rechazada", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-12 animate-in fade-in duration-1000">
      <ConfirmTransactionModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmarTransaccion}
        details={txDetails}
        loading={loading}
      />

      {/* OVERLAY DE CARGA DARK TECH */}
      {loading && (
        <div className="fixed inset-0 bg-[#0d0f14]/90 backdrop-blur-xl z-[1000] flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="font-black text-white italic uppercase tracking-[0.4em] text-xs animate-pulse text-center">
            Ejecutando Escritura en <br />
            <span className="text-blue-500 text-sm">Libro Mayor Digital</span>
          </p>
        </div>
      )}

      {/* CABECERA DE SECCIÓN */}
      <header className="border-l-4 border-blue-600 pl-6 py-2">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Activos{" "}
          <span className="text-blue-500 text-outline-sm">Digitales</span>
        </h2>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">
          Protocolo de Registro de Propiedades Inmutables
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LADO IZQUIERDO: ACCIONES (FORMULARIOS) */}
        <div className="lg:col-span-5 space-y-10">
          <div className="relative group">
            {/* Glow effect sutil */}
            <div className="absolute -inset-0.5 bg-blue-500/10 rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative">
              <RegistroPropiedad
                onPrepare={handlePrepare}
                showNotification={showNotification}
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-blue-500/10 rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative">
              <TransferirPropiedad
                onPrepare={handlePrepare}
                showNotification={showNotification}
              />
            </div>
          </div>
        </div>

        {/* LADO DERECHO: VISOR (LISTADO) */}
        <div className="lg:col-span-7">
          <div className="sticky top-32">
            <div className="bg-[#0d0f14]/40 border border-white/5 rounded-[2.5rem] p-1 overflow-hidden">
              <VisorPropiedades
                contract={contract}
                showNotification={showNotification}
              />
            </div>

            {/* DECORACIÓN TÉCNICA INFERIOR */}
            <div className="mt-6 flex items-center justify-between px-6 opacity-20">
              <div className="text-[8px] font-black text-white uppercase tracking-[0.3em]">
                Status: Syncing Ledger
              </div>
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-blue-500 rounded-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Propiedades;
