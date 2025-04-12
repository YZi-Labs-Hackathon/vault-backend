/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IEVMVaultFactory,
  IEVMVaultFactoryInterface,
} from "../../../../contracts/interfaces/IVaultFactory.sol/IEVMVaultFactory";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract IEVMVault",
        name: "vault",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "authority",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "VaultCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract IEVMVault",
        name: "vault",
        type: "address",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "collectFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "symbol",
            type: "string",
          },
          {
            internalType: "contract IERC20",
            name: "underlying",
            type: "address",
          },
          {
            internalType: "contract IProtocolHelper",
            name: "protocolHelper",
            type: "address",
          },
          {
            internalType: "address",
            name: "authority",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "initDepositAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minDepositAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxDepositAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
        ],
        internalType: "struct IEVMVaultFactory.CreateNewVaultParams",
        name: "params",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "createNewVault",
    outputs: [
      {
        internalType: "contract IEVMVault",
        name: "vault",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "signer",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IEVMVaultFactory__factory {
  static readonly abi = _abi;
  static createInterface(): IEVMVaultFactoryInterface {
    return new Interface(_abi) as IEVMVaultFactoryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IEVMVaultFactory {
    return new Contract(address, _abi, runner) as unknown as IEVMVaultFactory;
  }
}
