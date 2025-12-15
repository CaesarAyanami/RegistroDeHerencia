// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Personas {
    enum Genero { Masculino, Femenino, Otro }

    struct Persona {
        uint256 id;              // 🔹 Nuevo campo ID dentro del struct
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
        address wallet;          // identidad blockchain
    }

    uint256 private nextId = 1;
    mapping(uint256 => Persona) private personas;
    mapping(string => uint256) private ciAIdPersona;

    // Eventos para trazabilidad
    event PersonaRegistrada(uint256 id, string cedula, address wallet);
    event PersonaActualizada(uint256 id, string campo);

    // Registro esencial con wallet
    function registrarPersonaEsencial(
        string memory _cedula,
        string memory _nombres,
        string memory _apellidos,
        address _wallet
    ) public {
        require(ciAIdPersona[_cedula] == 0, "CI ya registrada");

        uint256 id = nextId++;
        ciAIdPersona[_cedula] = id;

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

        emit PersonaRegistrada(id, _cedula, _wallet);
    }

    // Registro completo (actualiza persona existente)
    function registrarPersona(
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
        string memory _profesion,
        address _wallet
    ) public {
        require(_id > 0 && _id < nextId, "ID no valido");
        require(ciAIdPersona[_cedula] == 0 || ciAIdPersona[_cedula] == _id, "CI duplicada o invalida");

        personas[_id] = Persona({
            id: _id,
            nombres: _nombres,
            apellidos: _apellidos,
            cedula: _cedula,
            genero: _genero,
            fechaNacimiento: _fechaNacimiento,
            lugarNacimiento: _lugarNacimiento,
            estadoCivil: _estadoCivil,
            direccion: _direccion,
            telefono: _telefono,
            profesion: _profesion,
            wallet: _wallet
        });

        ciAIdPersona[_cedula] = _id;

        emit PersonaActualizada(_id, "Registro completo");
    }

    // Funciones de consulta
    function obtenerIdPorCi(string memory _ci) public view returns (uint256) {
        require(ciAIdPersona[_ci] != 0, "CI no registrada");
        return ciAIdPersona[_ci];
    }

    function obtenerPersonaPorCI(string memory _cedula) public view returns (Persona memory) {
        uint256 id = ciAIdPersona[_cedula];
        require(id != 0, "Persona con esa cedula no encontrada");
        return personas[id];
    }

    function obtenerPersonaPorId(uint256 _id) public view returns (Persona memory) {
        require(_id > 0 && _id < nextId, "ID no valido");
        return personas[_id];
    }

    // Funciones de actualización parcial
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

    // Identidad rápida (para otros contratos)
    function obtenerIdentidad(uint256 _id) public view returns (string memory, address) {
        require(_id > 0 && _id < nextId, "ID no valido");
        return (personas[_id].cedula, personas[_id].wallet);
    }

    function obtenerIdentidadPorCI(string memory _ci) public view returns (string memory, address) {
        uint256 id = ciAIdPersona[_ci];
        require(id != 0, "CI no registrada");
        Persona memory p = personas[id];
        return (p.cedula, p.wallet);
    }
}
