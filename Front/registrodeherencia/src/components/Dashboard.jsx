import React, { useState, useCallback, useMemo } from "react";
import Web3 from "web3";
import HerenciaContract from "../ABI/RegistroPropiedadesHerencia.json";

export default function DashboardHerencia() {
    const [web3, setWeb3] = useState(null);
    const [account, setAccount] = useState("");
    const [balance, setBalance] = useState("0");
    const [contractAddress, setContractAddress] = useState("");
    const [networkName, setNetworkName] = useState("Cargando...");
    const [isConnected, setIsConnected] = useState(false);

    const [idPropiedad, setIdPropiedad] = useState("");
    const [propiedad, setPropiedad] = useState(null);
    const [herencia, setHerencia] = useState(null); // Usamos null para indicar que no se ha consultado

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const truncateAddress = (address) => {
        if (!address || typeof address !== 'string' || address.length < 10) return address;
        if (address === '0x0000000000000000000000000000000000000000') return "0x0 (Dirección Nula)";
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    // Validaciones para la consulta
    const isConsultaValid = useMemo(() => {
        return idPropiedad.trim() !== "";
    }, [idPropiedad]);

    const connectWallet = async () => {
        if (window.ethereum) {
            setLoading(true);
            setError(null);
            try {
                const web3Instance = new Web3(window.ethereum);
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                const currentAccount = accounts[0];

                const networkId = await web3Instance.eth.net.getId();
                const deployedNetwork = HerenciaContract.networks[networkId];
                const contractAddr = deployedNetwork ? deployedNetwork.address : "";

                setWeb3(web3Instance);
                setAccount(currentAccount);
                setContractAddress(contractAddr);
                setIsConnected(true);

                const networkMap = {
                    1: "Mainnet",
                    5: "Goerli",
                    1337: "Localhost/Ganache",
                    5777: "Truffle Develop"
                };
                setNetworkName(networkMap[networkId] || `ID: ${networkId}`);

                const balanceWei = await web3Instance.eth.getBalance(currentAccount);
                setBalance(web3Instance.utils.fromWei(balanceWei, "ether"));

                if (!deployedNetwork) {
                    setError("El contrato de Herencia no está desplegado en esta red.");
                }

            } catch (err) {
                console.error("Error al conectar:", err);
                setError("Error al conectar. Asegúrate de tener MetaMask instalado.");
                setIsConnected(false);
            } finally {
                setLoading(false);
            }
        } else {
            setError("MetaMask no detectado. Instálalo para usar la DApp.");
        }
    };

    const consultarPropiedad = async () => {
        if (!isConsultaValid) {
            setError("Por favor ingresa un ID de propiedad válido.");
            return;
        }
        if (!web3 || !contractAddress) {
            setError("El contrato no está disponible. Revisa la conexión.");
            return;
        }

        setLoading(true);
        setError(null);
        setPropiedad(null);
        
        try {
            const instance = new web3.eth.Contract(HerenciaContract.abi, contractAddress);
            const result = await instance.methods.obtenerPropiedad(idPropiedad).call();
            
            if (result.ciDueno === "" && result.walletDueno === '0x0000000000000000000000000000000000000000') {
                 setError(`Propiedad con ID ${idPropiedad} no encontrada o no registrada.`);
            } else {
                 setPropiedad(result);
            }
        } catch (err) {
            console.error(err);
            setError("Error al consultar propiedad. Verifica que el ID sea correcto.");
        } finally {
            setLoading(false);
        }
    };

    const consultarHerencia = async () => {
        if (!isConsultaValid) {
            setError("Por favor ingresa un ID de propiedad válido.");
            return;
        }
        if (!web3 || !contractAddress) {
            setError("El contrato no está disponible. Revisa la conexión.");
            return;
        }

        setLoading(true);
        setError(null);
        setHerencia(null);
        
        try {
            const instance = new web3.eth.Contract(HerenciaContract.abi, contractAddress);
            const result = await instance.methods.obtenerHerencia(idPropiedad).call();
            
            if (result.length === 0) {
                 setError(`No hay herencia definida para la propiedad ID ${idPropiedad}.`);
                 setHerencia([]); // Establecer como array vacío si no hay herencia
            } else {
                 setHerencia(result);
            }

        } catch (err) {
            console.error(err);
            setError("Error al consultar herencia. Verifica que el ID sea correcto.");
        } finally {
            setLoading(false);
        }
    };
    
    // Estilos de botón base
    const baseButtonClasses = "px-4 py-2 font-semibold text-white rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2";
    const primaryButtonClasses = `${baseButtonClasses} bg-blue-600 hover:bg-blue-700`;
    const secondaryButtonClasses = `${baseButtonClasses} bg-gray-500 hover:bg-gray-600`;

    // Si no está conectado, muestra la pantalla de conexión
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm w-full space-y-4">
                    <h2 className="text-3xl font-extrabold text-gray-900">Dashboard Herencia</h2>
                    <p className="text-gray-600">Conecta tu billetera Ethereum para acceder al sistema.</p>
                    {loading && (
                        <div className="flex items-center justify-center space-x-2 text-blue-500">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Conectando...</span>
                        </div>
                    )}
                    {error && (
                        <p className="text-red-600 font-medium p-2 bg-red-100 rounded-md border border-red-300">
                            ⚠️ {error}
                        </p>
                    )}
                    <button onClick={connectWallet} className={primaryButtonClasses} disabled={loading}>
                        Conectar Wallet
                    </button>
                </div>
            </div>
        );
    }

    // Dashboard principal
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl space-y-8">
                
                {/* Título y Estado */}
                <header className="text-center border-b pb-4">
                    <h1 className="text-4xl font-extrabold text-gray-900">
                        Dashboard de Propiedad y Herencia
                    </h1>
                </header>

                {/* --- Métrica de Conexión --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                        <p className="text-sm font-medium text-blue-800">Cuenta Conectada</p>
                        <p className="text-lg font-bold text-gray-900 truncate">{truncateAddress(account)}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                        <p className="text-sm font-medium text-blue-800">Balance (ETH)</p>
                        <p className="text-lg font-bold text-gray-900">{balance.substring(0, 8)}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                        <p className="text-sm font-medium text-blue-800">Red Activa</p>
                        <p className="text-lg font-bold text-gray-900">{networkName}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg shadow-md">
                        <p className="text-sm font-medium text-blue-800">Contrato Herencia</p>
                        <p className="text-lg font-bold text-gray-900 truncate">{truncateAddress(contractAddress)}</p>
                    </div>
                </div>

                {/* Manejo de Errores/Carga */}
                {loading && (
                    <div className="flex items-center justify-center space-x-2 text-blue-500 p-4 bg-blue-50 rounded-lg">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Cargando datos...</span>
                    </div>
                )}
                {error && (
                    <p className="text-red-600 font-medium p-3 bg-red-100 rounded-md border border-red-300">
                        ⚠️ {error}
                    </p>
                )}

                {/* --- Sección de Consulta --- */}
                <section className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Consultar Propiedad y Herencia</h2>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-end">
                        <div className="flex flex-col space-y-1 w-full sm:w-1/3">
                            <label className="text-sm font-medium text-gray-700">ID Propiedad</label>
                            <input
                                type="text"
                                placeholder="Ingresa el ID"
                                value={idPropiedad}
                                onChange={(e) => setIdPropiedad(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                            />
                        </div>
                        <button 
                            onClick={consultarPropiedad} 
                            className={primaryButtonClasses}
                            disabled={loading || !isConsultaValid}
                        >
                            Consultar Propiedad
                        </button>
                        <button 
                            onClick={consultarHerencia} 
                            className={`${secondaryButtonClasses} bg-indigo-600 hover:bg-indigo-700`}
                            disabled={loading || !isConsultaValid}
                        >
                            Consultar Herencia
                        </button>
                    </div>
                </section>
                
                {/* --- Resultados --- */}
                {(propiedad || herencia !== null) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Resultado de Propiedad */}
                        {propiedad && (
                            <div className="p-6 bg-green-50 border border-green-300 rounded-lg shadow-md space-y-2">
                                <h4 className="text-xl font-bold text-green-800">
                                    Propiedad (ID: {propiedad.idPropiedad})
                                </h4>
                                <p className="text-sm"><strong>Descripción:</strong> {propiedad.descripcion}</p>
                                <p className="text-sm"><strong>CI Dueño:</strong> {propiedad.ciDueno}</p>
                                <p className="text-sm break-words"><strong>Wallet Dueño:</strong> {truncateAddress(propiedad.walletDueno)}</p>
                                <p className="text-sm"><strong>En Herencia:</strong> <span className={propiedad.enHerencia ? 'text-red-500 font-semibold' : 'text-green-500 font-semibold'}>{propiedad.enHerencia ? "SÍ" : "NO"}</span></p>
                            </div>
                        )}

                        {/* Resultado de Herencia */}
                        {herencia !== null && (
                            <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow-md">
                                <h4 className="text-xl font-bold text-yellow-800 mb-3">Herencia Definida ({herencia.length} Herederos)</h4>
                                {herencia.length > 0 ? (
                                    <ul className="space-y-1">
                                        {herencia.map((h, index) => (
                                            <li key={index} className="text-sm border-b border-yellow-200 last:border-b-0 py-1">
                                                <strong>CI:</strong> {h.ciHeredero}, <strong>Wallet:</strong> {truncateAddress(h.walletHeredero)}, <strong>%:</strong> {h.porcentaje}%
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-700">No hay herederos definidos para esta propiedad.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}