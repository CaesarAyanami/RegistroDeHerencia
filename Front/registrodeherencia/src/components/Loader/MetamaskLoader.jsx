import React, { useState, useEffect, createContext, useContext } from "react";
import Web3 from "web3";

// IMPORTA TUS ABIS AQUÍ
import PersonasABI from "../../ABI/Personas.json";
import PropiedadesABI from "../../ABI/Propiedades.json";
import RegistroHerenciasABI from "../../ABI/Herencias.json";

const Web3Context = createContext();
export const useWeb3 = () => useContext(Web3Context);

export const MetamaskLoader = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState({
    personas: null,
    propiedades: null,
    herencias: null,
  });
  const [status, setStatus] = useState("loading");
  const [visible, setVisible] = useState(true);

  // Lógica original intacta
  const initWeb3 = async () => {
    setStatus("loading");
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const userAccount = accounts[0];
        const networkId = await web3.eth.net.getId();

        const initContract = (abiData) => {
          const deployedNetwork = abiData.networks[networkId];
          if (deployedNetwork) {
            return new web3.eth.Contract(abiData.abi, deployedNetwork.address);
          }
          return null;
        };

        const instPersonas = initContract(PersonasABI);
        const instPropiedades = initContract(PropiedadesABI);
        const instHerencias = initContract(RegistroHerenciasABI);

        if (!instPersonas || !instPropiedades || !instHerencias) {
          setStatus("error");
          return;
        }

        setAccount(userAccount);
        setContracts({
          personas: instPersonas,
          propiedades: instPropiedades,
          herencias: instHerencias,
          web3: web3,
        });

        setStatus("connected");
        setTimeout(() => setVisible(false), 1500);
      } catch (error) {
        setStatus("error");
      }
    } else {
      setStatus("error");
    }
  };

  useEffect(() => {
    initWeb3();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accs) => {
        if (accs.length > 0) setAccount(accs[0]);
        else window.location.reload();
      });
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{ account, web3: contracts.web3, ...contracts }}
    >
      {visible && (
        <div
          className={`fixed inset-0 z-[999] flex items-center justify-center bg-[#050608]/95 backdrop-blur-md transition-opacity duration-1000 ${
            status === "connected" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="bg-[#0d0f14] p-10 rounded-[3rem] border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center max-w-sm w-full mx-4 relative overflow-hidden">
            {/* DECORACIÓN DE FONDO */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

            {/* ESTADO: CARGANDO */}
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 border-2 border-blue-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter animate-pulse">
                  Iniciando Nodo
                </h3>
                <p className="text-blue-500 font-black text-[8px] uppercase tracking-[0.5em] mt-2">
                  Sincronizando Protocolos
                </p>
                <div className="mt-8 flex gap-1">
                  <span className="w-1 h-1 bg-blue-500/40 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 bg-blue-500/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 bg-blue-500/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            {/* ESTADO: CONECTADO */}
            {status === "connected" && (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                  <svg
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                  Acceso Concedido
                </h3>
                <p className="text-green-500 font-black text-[8px] uppercase tracking-[0.5em] mt-2 text-center">
                  Identidad Verificada en Ledger
                </p>
              </div>
            )}

            {/* ESTADO: ERROR */}
            {status === "error" && (
              <div className="flex flex-col items-center text-center animate-in fade-in">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-8 text-red-500">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                  Fallo de Enlace
                </h3>
                <p className="text-gray-500 mt-2 mb-8 text-[10px] font-bold uppercase tracking-widest px-4 leading-relaxed">
                  Red no detectada o autorización denegada
                </p>
                <button
                  onClick={initWeb3}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Reintentar Enlace
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {!visible && children}
    </Web3Context.Provider>
  );
};
