// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Personas
 * @dev Contrato para el registro seguro de personas en el Registro Civil. Implementa su propio patrón Ownable.
 * @notice Solo el dueño (Owner) puede registrar y actualizar personas.
 * @author Your Name (Optimizado por Gemini sin dependencias)
 */
contract Personas {

    // --- Control de Acceso (Patrón Ownable) ---

    // Dirección que tiene permiso para realizar operaciones administrativas.
    address private owner;

    // Modificador para restringir el acceso a ciertas funciones solo al dueño.
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede llamar a esta funcion");
        _;
    }

    /**
     * @dev El constructor establece el desplegador del contrato como el propietario (owner).
     */
    constructor() {
        owner = msg.sender;
    }

    // --- Definición de Estructuras y Enumeraciones ---

    // Definición de los posibles géneros de una persona
    enum Genero { Masculino, Femenino, Otro }

    // Estructura que representa a una persona con sus datos básicos
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

    // --- Variables de Estado y Mappings ---

    // Contador para generar IDs únicos (comienza en 1, el ID 0 se usa como nulo/no encontrado)
    uint256 private nextId = 1;

    // Mapping principal: Almacena la Persona, usando su ID como clave
    mapping(uint256 => Persona) private personas;

    // Mapping optimizado: Busca el ID de una persona a partir de su cédula (O(1) de complejidad)
    mapping(string => uint256) private ciAIdPersona; 

    // --- Eventos ---

    event PersonaRegistrada(uint256 indexed id, string indexed cedula, address indexed registrador);
    event PersonaActualizada(uint256 indexed id, string indexed cedula, address indexed actualizador);
    event CedulaModificada(uint256 indexed id, string oldCedula, string newCedula);

    // --- Funciones de Escritura (Protegidas por onlyOwner) ---

    /**
     * @dev Registra una nueva persona. Solo el propietario puede llamar a esta función.
     */
    function registrarPersona(
        string memory _cedula,
        string memory _nombres,
        string memory _apellidos,
        Genero _genero,
        uint256 _fechaNacimiento,
        string memory _lugarNacimiento,
        string memory _estadoCivil,
        string memory _direccion,
        string memory _telefono,
        string memory _profesion
    ) public onlyOwner {
        // Validación: Asegurar que la cédula no esté ya registrada
        require(ciAIdPersona[_cedula] == 0, "Error: CI ya registrada");

        uint256 id = nextId;
        
        ciAIdPersona[_cedula] = id;
        personas[id] = Persona({
            nombres: _nombres,
            apellidos: _apellidos,
            cedula: _cedula,
            genero: _genero,
            fechaNacimiento: _fechaNacimiento,
            lugarNacimiento: _lugarNacimiento,
            estadoCivil: _estadoCivil,
            direccion: _direccion,
            telefono: _telefono,
            profesion: _profesion
        });

        nextId = id + 1;
        
        emit PersonaRegistrada(id, _cedula, msg.sender);
    }
    
    /**
     * @dev Actualiza todos los campos de una persona existente.
     */
    function actualizarPersona(
        uint256 _id,
        string memory _nombres,
        string memory _apellidos,
        string memory _cedula,
        Genero _genero,
        uint256 _fechaNacimiento,
        string memory _lugarNacimiento,
        string memory _estadoCivil,
        string memory _direccion,
        string memory _telefono,
        string memory _profesion
    ) public onlyOwner {
        // Validación: Asegurar que el ID sea un registro existente
        require(_id > 0 && _id < nextId, "Error: ID no valido o inexistente");

        Persona storage personaAActualizar = personas[_id];
        string memory oldCedula = personaAActualizar.cedula;

        // Lógica de Actualización de Cédula:
        if (keccak256(bytes(oldCedula)) != keccak256(bytes(_cedula))) {
            require(ciAIdPersona[_cedula] == 0, "Error: La nueva CI ya pertenece a otro registro");
            
            delete ciAIdPersona[oldCedula];
            ciAIdPersona[_cedula] = _id;
            
            emit CedulaModificada(_id, oldCedula, _cedula);
        }

        // Actualizar todos los campos
        personaAActualizar.nombres = _nombres;
        personaAActualizar.apellidos = _apellidos;
        personaAActualizar.cedula = _cedula;
        personaAActualizar.genero = _genero;
        personaAActualizar.fechaNacimiento = _fechaNacimiento;
        personaAActualizar.lugarNacimiento = _lugarNacimiento;
        personaAActualizar.estadoCivil = _estadoCivil;
        personaAActualizar.direccion = _direccion;
        personaAActualizar.telefono = _telefono;
        personaAActualizar.profesion = _profesion;

        emit PersonaActualizada(_id, _cedula, msg.sender);
    }

    // --- Funciones de Lectura (View/Puras) ---

    /**
     * @dev Obtiene la dirección del dueño del contrato.
     */
    function getOwner() public view returns (address) {
        return owner;
    }

    /**
     * @dev Obtiene el total de personas registradas.
     */
    function totalPersonas() public view returns (uint256) {
        return nextId - 1;
    }

    /**
     * @dev Obtiene los datos de una persona a partir de su ID.
     */
    function obtenerDatosPersona(uint256 _id) public view returns (Persona memory) {
        require(_id > 0 && _id < nextId, "Error: Persona no registrada");
        return personas[_id];
    }

    /**
     * @dev Obtiene los datos de una persona a partir de su cédula de identidad (CI).
     * Búsqueda O(1) eficiente.
     */
    function obtenerPersonaPorCI(string memory _cedula) public view returns (Persona memory) {
        uint256 id = ciAIdPersona[_cedula];
        require(id != 0, "Error: CI no registrada"); 
        return personas[id];
    }
}