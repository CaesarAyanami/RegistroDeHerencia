// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Personas {
    enum Genero { Masculino, Femenino, Otro }

    struct Persona {
        uint256 id;
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
        address wallet;
    }

    uint256 private nextId = 1;
    mapping(uint256 => Persona) private personas;
    mapping(bytes32 => uint256) private ciHashAIdPersona; // 🔹 usamos hash de CI
    uint256[] private idsPersonas; // 🔹 para listar todas las personas

    // Eventos
    event PersonaRegistrada(uint256 id, string cedula, address wallet);
    event PersonaActualizada(uint256 id, string campo);

    // Registro esencial
    function registrarPersonaEsencial(
        string memory _cedula,
        string memory _nombres,
        string memory _apellidos,
        address _wallet
    ) public {
        bytes32 ciHash = keccak256(bytes(_cedula));
        require(ciHashAIdPersona[ciHash] == 0, "CI ya registrada");
        require(_wallet != address(0), "Wallet invalida");

        uint256 id = nextId++;
        ciHashAIdPersona[ciHash] = id;

        personas[id] = Persona({
            id: id,
            nombres: _nombres,
            apellidos: _apellidos,
            cedula: _cedula,
            genero: Genero.Otro,
            fechaNacimiento: 0,
            lugarNacimiento: "",
            estadoCivil: "",
            direccion: "",
            telefono: "",
            profesion: "",
            wallet: _wallet
        });

        idsPersonas.push(id);

        emit PersonaRegistrada(id, _cedula, _wallet);
    }

    // Registro completo (no permite cambiar CI)
    function registrarPersona(
        uint256 _id,
        string memory _nombres,
        string memory _apellidos,
        Genero _genero,
        uint256 _fechaNacimiento,
        string memory _lugarNacimiento,
        string memory _estadoCivil,
        string memory _direccion,
        string memory _telefono,
        string memory _profesion,
        address _wallet
    ) public {
        require(_id > 0 && _id < nextId, "ID no valido");
        require(_wallet != address(0), "Wallet invalida");

        Persona storage p = personas[_id];
        // 🔹 CI no se cambia, se mantiene la original
        personas[_id] = Persona({
            id: _id,
            nombres: _nombres,
            apellidos: _apellidos,
            cedula: p.cedula,
            genero: _genero,
            fechaNacimiento: _fechaNacimiento,
            lugarNacimiento: _lugarNacimiento,
            estadoCivil: _estadoCivil,
            direccion: _direccion,
            telefono: _telefono,
            profesion: _profesion,
            wallet: _wallet
        });

        emit PersonaActualizada(_id, "Registro completo");
    }

    // Consultas
    function obtenerIdPorCi(string memory _ci) public view returns (uint256) {
        uint256 id = ciHashAIdPersona[keccak256(bytes(_ci))];
        require(id != 0, "CI no registrada");
        return id;
    }

    function obtenerPersonaPorCI(string memory _cedula) public view returns (Persona memory) {
        uint256 id = ciHashAIdPersona[keccak256(bytes(_cedula))];
        require(id != 0, "Persona con esa cedula no encontrada");
        return personas[id];
    }

    function obtenerPersonaPorId(uint256 _id) public view returns (Persona memory) {
        require(_id > 0 && _id < nextId, "ID no valido");
        return personas[_id];
    }

    // Actualizaciones parciales
    function actualizarTelefono(uint256 _id, string memory _telefono) public {
        require(_id > 0 && _id < nextId, "ID no valido");
        personas[_id].telefono = _telefono;
        emit PersonaActualizada(_id, "Telefono");
    }

    function actualizarDireccion(uint256 _id, string memory _direccion) public {
        require(_id > 0 && _id < nextId, "ID no valido");
        personas[_id].direccion = _direccion;
        emit PersonaActualizada(_id, "Direccion");
    }

    // Identidad rápida
    function obtenerIdentidad(uint256 _id) public view returns (string memory, address) {
        require(_id > 0 && _id < nextId, "ID no valido");
        return (personas[_id].cedula, personas[_id].wallet);
    }

    function obtenerIdentidadPorCI(string memory _ci) public view returns (string memory, address) {
        uint256 id = ciHashAIdPersona[keccak256(bytes(_ci))];
        require(id != 0, "CI no registrada");
        Persona memory p = personas[id];
        return (p.cedula, p.wallet);
    }

    // 🔹 Listar todas las personas (view, no consume gas en frontend)
    function listarPersonas() public view returns (Persona[] memory) {
        Persona[] memory result = new Persona[](idsPersonas.length);
        for (uint256 i = 0; i < idsPersonas.length; i++) {
            result[i] = personas[idsPersonas[i]];
        }
        return result;
    }

    // Total de personas registradas
    function totalPersonas() public view returns (uint256) {
        return nextId - 1;
    }
}
