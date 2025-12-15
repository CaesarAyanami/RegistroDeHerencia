// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPersonas {
    function obtenerIdPorCi(string memory _ci) external view returns (uint256);
    function obtenerIdentidad(uint256 _id) external view returns (string memory, address);
}
