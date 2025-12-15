// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// =========================================================================
// INTERFAZ DE PERSONAS (Alineada exactamente con el contrato Personas)
// =========================================================================
interface IPersonas {
    // Definición del enum Genero
    enum Genero { Masculino, Femenino, Otro }

    // Estructura Persona (Sin el campo 'walletAddress' que no existe en el original)
    struct Persona {
        string nombres;
        string apellidos;
        string cedula;
        Genero genero;
        uint256 fechaNacimiento;
        string lugarNacimiento;
        string estadoCivil;
        string direccion;
        string telefono;
        string profesion;
    }
    
    // Funciones de consulta del contrato Personas
    // (obtenerIdPorCi también es útil, pero no es obligatoria para este caso)
    function obtenerPersonaPorCI(string memory _cedula) external view returns (Persona memory);
    function obtenerDatosPersona(uint256 _id) external view returns (Persona memory);
}

// =========================================================================
// CONTRATO PRINCIPAL DE HERENCIA
// =========================================================================
contract HerenciaConRegistro {
    IPersonas public registroCivil; 

    // Identificadores y Wallets (Almacenamos las direcciones aquí ya que Personas no las tiene)
    string public ciTestador; 
    string public ciHeredero; 
    address public walletTestador; // La wallet del testador (Quien despliega)
    address public walletHeredero; // La wallet del heredero (Necesaria para el envío)
    
    uint public periodoEspera; 
    uint public tiempoCreacion; 
    bool public pruebaFallecimientoActivada = false;

    // Eventos
    event HerenciaCreada(string _ciTestador, string _ciHeredero, address _walletHeredero);
    event PruebaFallecimientoActivada(address indexed _activador);
    event HerenciaReclamada(string _ciHeredero, address indexed _walletHeredero, uint _monto);

    /**
     * @dev Constructor del contrato de herencia
     * @param _direccionPersonas Dirección del contrato Personas ya desplegado
     * @param _ciTestador CI de la persona que establece la herencia
     * @param _ciHeredero CI de la persona que recibirá la herencia
     * @param _walletHeredero Dirección de la billetera del heredero (No está en Personas)
     * @param _periodoEsperaDias Tiempo en días que debe transcurrir para reclamar
     */
    constructor(
        address _direccionPersonas,
        string memory _ciTestador, 
        string memory _ciHeredero, 
        address _walletHeredero, // **NUEVO CAMPO REQUERIDO**
        uint _periodoEsperaDias
    ) payable {
        // 1. Asignar el contrato de Personas
        require(_direccionPersonas != address(0), "Direccion del Registro Civil invalida.");
        registroCivil = IPersonas(_direccionPersonas);

        // 2. Seguridad: El que despliega debe ser el Testador
        walletTestador = msg.sender;

        // 3. Verificar que las CI existen usando el contrato Personas
        // Si no existen, 'obtenerPersonaPorCI' lanzará un revert.
        registroCivil.obtenerPersonaPorCI(_ciTestador);
        registroCivil.obtenerPersonaPorCI(_ciHeredero);

        // 4. Asignar variables de estado
        ciTestador = _ciTestador;
        ciHeredero = _ciHeredero;
        walletHeredero = _walletHeredero; // Almacenamos la wallet del heredero
        periodoEspera = _periodoEsperaDias * 1 days;
        tiempoCreacion = block.timestamp;
        
        emit HerenciaCreada(ciTestador, ciHeredero, walletHeredero);
    }

    /**
     * @dev Función para que el Testador active la "prueba de fallecimiento".
     * Solo puede ser llamado por la wallet del Testador.
     */
    function activarPruebaFallecimiento() public {
        // La seguridad se basa en que 'msg.sender' es la walletTestador original
        require(msg.sender == walletTestador, "Solo el testador (wallet original) puede activar esta funcion.");
        require(!pruebaFallecimientoActivada, "Prueba ya activada.");
        
        pruebaFallecimientoActivada = true;
        emit PruebaFallecimientoActivada(msg.sender);
    }

    /**
     * @dev Obtiene la información clave del testador y el estado de la herencia.
     */
    function obtenerDatosContrato() 
        public 
        view 
        returns (
            string memory _ciTestador, 
            address _walletTestador, 
            bool _pruebaFallecimientoActivada,
            uint _balance
        ) 
    {
        return (
            ciTestador,
            walletTestador,
            pruebaFallecimientoActivada,
            address(this).balance
        );
    }

    /**
     * @dev El heredero llama a esta función para reclamar los fondos.
     * El Ether se envía a la dirección vinculada a su CI.
     */
    function reclamarHerencia() public {
        // 1. Verificar que quien llama es la wallet del heredero predefinida
        require(msg.sender == walletHeredero, "Solo la wallet vinculada al heredero puede reclamar.");
        
        // 2. Verificar que la prueba de fallecimiento ha sido activada
        require(pruebaFallecimientoActivada, "La prueba de fallecimiento aun no ha sido activada.");

        // 3. Verificar que ha pasado el periodo de espera
        require(block.timestamp >= tiempoCreacion + periodoEspera, "El periodo de espera aun no ha finalizado.");

        // 4. Obtener el saldo y transferir
        uint monto = address(this).balance;
        require(monto > 0, "No hay fondos para reclamar.");

        // 5. Transferir todo el Ether a la wallet del heredero
        (bool success, ) = payable(walletHeredero).call{value: monto}("");
        require(success, "La transferencia de Ether fallo.");

        emit HerenciaReclamada(ciHeredero, walletHeredero, monto);
    }

    /**
     * @dev Permite al Testador original retirar los fondos.
     */
    function retirarFondos() public {
        require(msg.sender == walletTestador, "Solo el testador puede retirar fondos.");
        require(!pruebaFallecimientoActivada, "Los fondos ya estan bloqueados para la herencia.");
        
        uint monto = address(this).balance;
        (bool success, ) = payable(walletTestador).call{value: monto}("");
        require(success, "El retiro de fondos fallo.");
    }

    // Para recibir Ether
    receive() external payable {}
}