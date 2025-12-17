// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IPersonas.sol";

contract Propiedades {
    IPersonas private personasContract;

    constructor(address _personasAddress) {
        personasContract = IPersonas(_personasAddress);
    }

    struct Propiedad {
        uint256 idPropiedad;
        string descripcion;
        string ciDueno;
        address walletDueno;
        bool enHerencia;
    }

    uint256 private nextPropId = 1;
    mapping(uint256 => Propiedad) private propiedades;
    mapping(bytes32 => uint256[]) private propiedadesPorCI; // 🔹 usamos hash de CI para eficiencia

    event PropiedadRegistrada(uint256 idPropiedad, string ciDueno, address walletDueno);
    event PropiedadTransferida(uint256 idPropiedad, string ciAnteriorDueno, string ciNuevoDueno);

    // Registrar propiedad VALIDANDO CI contra Personas
    function registrarPropiedad(string memory _ciDueno, string memory _descripcion) public {
        uint256 idPersona = personasContract.obtenerIdPorCi(_ciDueno);
        (, address wallet) = personasContract.obtenerIdentidad(idPersona);

        require(wallet == msg.sender, "Solo el dueno puede registrar su propiedad");
        require(wallet != address(0), "Wallet invalida");

        uint256 idProp = nextPropId++;
        propiedades[idProp] = Propiedad({
            idPropiedad: idProp,
            descripcion: _descripcion,
            ciDueno: _ciDueno,
            walletDueno: wallet,
            enHerencia: false
        });

        propiedadesPorCI[keccak256(bytes(_ciDueno))].push(idProp);

        emit PropiedadRegistrada(idProp, _ciDueno, wallet);
    }

    // Transferir propiedad a nuevo CI (actualiza wallet también)
    function transferirPropiedad(uint256 _idPropiedad, string memory _ciNuevoDueno) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(prop.idPropiedad != 0, "Propiedad no existe");
        require(prop.walletDueno == msg.sender, "No eres el dueno actual");

        // Obtener wallet del nuevo dueño desde Personas
        uint256 idNuevo = personasContract.obtenerIdPorCi(_ciNuevoDueno);
        (, address walletNuevo) = personasContract.obtenerIdentidad(idNuevo);
        require(walletNuevo != address(0), "Wallet invalida");

        string memory ciAnteriorDueno = prop.ciDueno;

        // 🔹 Actualizar propiedad
        prop.ciDueno = _ciNuevoDueno;
        prop.walletDueno = walletNuevo;

        // 🔹 Eliminar del array del dueño anterior
        uint256[] storage idsAnterior = propiedadesPorCI[keccak256(bytes(ciAnteriorDueno))];
        for (uint256 i = 0; i < idsAnterior.length; i++) {
            if (idsAnterior[i] == _idPropiedad) {
                idsAnterior[i] = idsAnterior[idsAnterior.length - 1];
                idsAnterior.pop();
                break;
            }
        }

        // 🔹 Agregar al nuevo dueño
        propiedadesPorCI[keccak256(bytes(_ciNuevoDueno))].push(_idPropiedad);

        emit PropiedadTransferida(_idPropiedad, ciAnteriorDueno, _ciNuevoDueno);
    }

    // Consultar propiedad por ID
    function obtenerPropiedad(uint256 _idPropiedad) public view returns (Propiedad memory) {
        require(propiedades[_idPropiedad].idPropiedad != 0, "Propiedad no encontrada");
        return propiedades[_idPropiedad];
    }

    // Listar todas las propiedades de un usuario según su CI
    function listarPropiedadesPorCI(string memory _ciPersona) public view returns (Propiedad[] memory) {
        uint256[] memory ids = propiedadesPorCI[keccak256(bytes(_ciPersona))];
        Propiedad[] memory result = new Propiedad[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = propiedades[ids[i]];
        }
        return result;
    }

    // Contar propiedades de un usuario por CI
    function contarPropiedadesPorCI(string memory _ciPersona) public view returns (uint256) {
        return propiedadesPorCI[keccak256(bytes(_ciPersona))].length;
    }

    // Marcar propiedad como en herencia (solo dueño actual)
    function marcarEnHerencia(uint256 _idPropiedad) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(prop.idPropiedad != 0, "Propiedad no existe");
        require(prop.walletDueno == msg.sender, "No eres el dueno actual");
        prop.enHerencia = true;
    }

    // Total de propiedades registradas
    function totalPropiedades() public view returns (uint256) {
        return nextPropId - 1;
    }
}
