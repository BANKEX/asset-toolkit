// tslint:disable:quotemark
export class ContractData {

  public address;
  public abi;
  public apiAddress?;

  /**
   * Returns hardcoded settings if needed
   */
  static getData() {
    return {
    apiAddress: 'https://plasma.bankex.com/',
    address: '0x075aeb00624b5fe91a003bd00667285860ad490e',
    abi: [{
        constant: true,
        inputs: [{
          name: "",
          type: "address"
        }],
        name: "operators",
        outputs: [{
          name: "",
          type: "bool"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "WithdrawCollateral",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "plasmaErrorFound",
        outputs: [{
          name: "",
          type: "bool"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "lastEthBlockNumber",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "lastValidBlock",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "DepositWithdrawDelay",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "ExitDelay",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "blockStorage",
        outputs: [{
          name: "",
          type: "address"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [{
            name: "",
            type: "address"
          },
          {
            name: "",
            type: "uint256"
          }
        ],
        name: "allWithdrawRecordsForUser",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "blockHeaderLength",
        outputs: [{
          name: "",
          type: "uint32"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [{
          name: "",
          type: "uint256"
        }],
        name: "depositRecords",
        outputs: [{
            name: "from",
            type: "address"
          },
          {
            name: "status",
            type: "uint8"
          },
          {
            name: "hasCollateral",
            type: "bool"
          },
          {
            name: "amount",
            type: "uint256"
          },
          {
            name: "withdrawStartedAt",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "DepositWithdrawCollateral",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "hashOfLastSubmittedBlock",
        outputs: [{
          name: "",
          type: "bytes32"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "owner",
        outputs: [{
          name: "",
          type: "address"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [{
          name: "",
          type: "uint256"
        }],
        name: "withdrawRecords",
        outputs: [{
            name: "blockNumber",
            type: "uint32"
          },
          {
            name: "txNumberInBlock",
            type: "uint32"
          },
          {
            name: "outputNumberInTX",
            type: "uint8"
          },
          {
            name: "status",
            type: "uint8"
          },
          {
            name: "isExpress",
            type: "bool"
          },
          {
            name: "hasCollateral",
            type: "bool"
          },
          {
            name: "beneficiary",
            type: "address"
          },
          {
            name: "amount",
            type: "uint256"
          },
          {
            name: "timestamp",
            type: "uint256"
          }
        ],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "challengesContract",
        outputs: [{
          name: "",
          type: "address"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [{
            name: "",
            type: "address"
          },
          {
            name: "",
            type: "uint256"
          }
        ],
        name: "allDepositRecordsForUser",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "WithdrawDelay",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "depositCounterInBlock",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [{
          name: "",
          type: "uint256"
        }],
        name: "transactionsSpendingRecords",
        outputs: [{
          name: "",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "exitQueue",
        outputs: [{
          name: "",
          type: "address"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [{
            name: "_priorityQueue",
            type: "address"
          },
          {
            name: "_blockStorage",
            type: "address"
          }
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        payable: false,
        stateMutability: "nonpayable",
        type: "fallback"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_success",
            type: "bool"
          },
          {
            indexed: true,
            name: "_b",
            type: "bytes32"
          },
          {
            indexed: true,
            name: "_signer",
            type: "address"
          }
        ],
        name: "Debug",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_1",
            type: "uint256"
          },
          {
            indexed: true,
            name: "_2",
            type: "uint256"
          },
          {
            indexed: true,
            name: "_3",
            type: "uint256"
          }
        ],
        name: "DebugUint",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_signer",
            type: "address"
          },
          {
            indexed: true,
            name: "_r",
            type: "bytes32"
          },
          {
            indexed: true,
            name: "_s",
            type: "bytes32"
          }
        ],
        name: "SigEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_from",
            type: "address"
          },
          {
            indexed: true,
            name: "_amount",
            type: "uint256"
          },
          {
            indexed: true,
            name: "_depositIndex",
            type: "uint256"
          }
        ],
        name: "DepositEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
          indexed: true,
          name: "_depositIndex",
          type: "uint256"
        }],
        name: "DepositWithdrawStartedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
          indexed: true,
          name: "_depositIndex",
          type: "uint256"
        }],
        name: "DepositWithdrawChallengedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
          indexed: true,
          name: "_depositIndex",
          type: "uint256"
        }],
        name: "DepositWithdrawCompletedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_blockNumber",
            type: "uint32"
          },
          {
            indexed: true,
            name: "_txNumberInBlock",
            type: "uint32"
          },
          {
            indexed: true,
            name: "_outputNumberInTX",
            type: "uint8"
          }
        ],
        name: "WithdrawStartedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_from",
            type: "address"
          },
          {
            indexed: true,
            name: "_withdrawIndex",
            type: "uint256"
          }
        ],
        name: "WithdrawRequestAcceptedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_from",
            type: "address"
          },
          {
            indexed: true,
            name: "_withdrawIndex",
            type: "uint256"
          }
        ],
        name: "WithdrawChallengedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_blockNumber",
            type: "uint32"
          },
          {
            indexed: true,
            name: "_txNumberInBlock",
            type: "uint32"
          },
          {
            indexed: true,
            name: "_outputNumberInTX",
            type: "uint8"
          }
        ],
        name: "WithdrawFinalizedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_from",
            type: "address"
          },
          {
            indexed: true,
            name: "_priority",
            type: "uint256"
          }
        ],
        name: "ExitStartedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_txIndex1",
            type: "uint256"
          },
          {
            indexed: true,
            name: "_txIndex2",
            type: "uint256"
          }
        ],
        name: "DoubleSpendProovedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_txIndex",
            type: "uint256"
          },
          {
            indexed: true,
            name: "_withdrawIndex",
            type: "uint256"
          }
        ],
        name: "SpendAndWithdrawProovedEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_txIndex",
            type: "uint256"
          },
          {
            indexed: true,
            name: "_depositIndex",
            type: "uint256"
          }
        ],
        name: "FundingWithoutDepositEvent",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [{
            indexed: true,
            name: "_txIndex1",
            type: "uint256"
          },
          {
            indexed: true,
            name: "_txIndex2",
            type: "uint256"
          }
        ],
        name: "DoubleFundingEvent",
        type: "event"
      },
      {
        constant: false,
        inputs: [{
            name: "_op",
            type: "address"
          },
          {
            name: "_status",
            type: "bool"
          }
        ],
        name: "setOperator",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
          name: "_challenger",
          type: "address"
        }],
        name: "setChallenger",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
          name: "_headers",
          type: "bytes"
        }],
        name: "submitBlockHeaders",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: true,
        inputs: [],
        name: "lastBlockNumber",
        outputs: [{
          name: "blockNumber",
          type: "uint256"
        }],
        payable: false,
        stateMutability: "view",
        type: "function"
      },
      {
        constant: false,
        inputs: [],
        name: "deposit",
        outputs: [{
          name: "idx",
          type: "uint256"
        }],
        payable: true,
        stateMutability: "payable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
          name: "depositIndex",
          type: "uint256"
        }],
        name: "startDepositWithdraw",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: true,
        stateMutability: "payable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
          name: "depositIndex",
          type: "uint256"
        }],
        name: "finalizeDepositWithdraw",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
            name: "depositIndex",
            type: "uint256"
          },
          {
            name: "_plasmaBlockNumber",
            type: "uint32"
          },
          {
            name: "_plasmaTransaction",
            type: "bytes"
          },
          {
            name: "_merkleProof",
            type: "bytes"
          }
        ],
        name: "challengeDepositWithdraw",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
            name: "_plasmaBlockNumber",
            type: "uint32"
          },
          {
            name: "_plasmaTxNumInBlock",
            type: "uint32"
          },
          {
            name: "_outputNumber",
            type: "uint8"
          },
          {
            name: "_plasmaTransaction",
            type: "bytes"
          },
          {
            name: "_merkleProof",
            type: "bytes"
          }
        ],
        name: "startWithdraw",
        outputs: [{
            name: "success",
            type: "bool"
          },
          {
            name: "withdrawIndex",
            type: "uint256"
          }
        ],
        payable: true,
        stateMutability: "payable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
            name: "_plasmaBlockNumber",
            type: "uint32"
          },
          {
            name: "_plasmaTxNumInBlock",
            type: "uint32"
          },
          {
            name: "_inputNumber",
            type: "uint8"
          },
          {
            name: "_plasmaTransaction",
            type: "bytes"
          },
          {
            name: "_merkleProof",
            type: "bytes"
          },
          {
            name: "_withdrawIndex",
            type: "uint256"
          }
        ],
        name: "challengeWithdraw",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
          name: "withdrawIndex",
          type: "uint256"
        }],
        name: "finalizeWithdraw",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        constant: false,
        inputs: [{
          name: "_numOfExits",
          type: "uint256"
        }],
        name: "finalizeExits",
        outputs: [{
          name: "success",
          type: "bool"
        }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
      }
    ]
  }}
}
