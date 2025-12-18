import React, { useState } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import { prepareTransaction } from "../utils/TransactionHandler";

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

  const handlePrepare = async (method) => {
    try {
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
      showNotification("Transacción confirmada con éxito", "success");
      setDatosEdicion(null);
    } catch (err) {
      showNotification("Transacción fallida", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <ConfirmTransactionModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmarTransaccion}
        details={txDetails}
        loading={loading}
      />

      {/* OVERLAY DE CARGA */}
      {loading && (
        <div className="fixed inset-0 bg-[#0d0f14]/90 backdrop-blur-xl z-[1000] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="mt-8 text-sm font-black text-white italic uppercase tracking-[0.3em] animate-pulse">
            Sincronizando con <span className="text-blue-500">Blockchain</span>
          </h2>
        </div>
      )}

      {/* CABECERA */}
      <header className="border-l-4 border-blue-600 pl-6 py-2">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          Gestión de{" "}
          <span className="text-blue-500 text-outline-sm">Identidades</span>
        </h2>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1 ml-1">
          Base de Datos de Registro Civil Descentralizada
        </p>
      </header>

      {/* GRID CORREGIDO: 7/5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* COLUMNA FORMULARIOS (7 de 12) */}
        <div className="lg:col-span-7 space-y-10">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/10 to-transparent rounded-[2.5rem] blur opacity-75"></div>
            <div className="relative">
              <RegistroEsencial
                contract={contract}
                account={account}
                onPrepare={handlePrepare}
                showNotification={showNotification}
              />
            </div>
          </div>

          <EditorDetallado
            contract={contract}
            account={account}
            data={datosEdicion}
            onCancel={() => setDatosEdicion(null)}
            onPrepare={handlePrepare}
            showNotification={showNotification}
          />
        </div>

        {/* COLUMNA DERECHA (5 de 12) */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 space-y-8">
            <BuscadorPersona
              contract={contract}
              onEdit={(data) => setDatosEdicion(data)}
              showNotification={showNotification}
            />

            {/* INFO PANEL */}
            <div className="p-8 border border-white/5 rounded-[2.5rem] bg-[#0d0f14] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl italic font-black">
                SYSTEM
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">
                  Nodo Activo: Sincronizado
                </span>
              </div>
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-2/3 animate-pulse"></div>
                </div>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                  Carga de Red: Optimizada (12 gwei)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personas;
