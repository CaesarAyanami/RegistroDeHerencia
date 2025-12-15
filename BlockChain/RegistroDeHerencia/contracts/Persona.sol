// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Personas {
    enum Genero { Masculino, Femenino, Otro }

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

    uint256 private nextId = 1;
    mapping(uint256 => Persona) private personas;
    mapping(string => uint256) private ciAIdPersona;

    function registrarPersonaEsencial(
        string memory _cedula,
        string memory _nombres,
        string memory _apellidos
    ) public {
        require(ciAIdPersona[_cedula] == 0, "CI ya registrada");
        uint256 id = nextId++;
        ciAIdPersona[_cedula] = id;
        personas[id] = Persona({
            nombres: _nombres,
            apellidos: _apellidos,
            cedula: _cedula,
            genero: Genero.Otro,
            fechaNacimiento: 0,
            lugarNacimiento: "",
            estadoCivil: "",
            direccion: "",
            telefono: "",
            profesion: ""
        });
    }

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
        string memory _profesion
    ) public {
        require(_id > 0 && _id < nextId, "ID no valido");
        require(ciAIdPersona[_cedula] == 0 || ciAIdPersona[_cedula] == _id, "CI duplicada o invalida");

        personas[_id] = Persona({
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

        // Mantener sincronizado el mapping de CI
        ciAIdPersona[_cedula] = _id;
    }

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
}
