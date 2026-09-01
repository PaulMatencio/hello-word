import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = __compactRuntime.CompactTypeBoolean;

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _TransferOutput_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      recipientCommitment: _descriptor_0.fromValue(value_0),
      changeCommitment: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.recipientCommitment).concat(_descriptor_0.toValue(value_0.changeCommitment));
  }
}

const _descriptor_3 = new _TransferOutput_0();

class _ShareHolding_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      ownerPk: _descriptor_0.fromValue(value_0),
      amount: _descriptor_2.fromValue(value_0),
      salt: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.ownerPk).concat(_descriptor_2.toValue(value_0.amount).concat(_descriptor_0.toValue(value_0.salt)));
  }
}

const _descriptor_4 = new _ShareHolding_0();

class _NullifierData_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      commitment: _descriptor_0.fromValue(value_0),
      secretKey: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.commitment).concat(_descriptor_0.toValue(value_0.secretKey));
  }
}

const _descriptor_5 = new _NullifierData_0();

class _Either_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_1.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_6 = new _Either_0();

const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_8 = new _ContractAddress_0();

const _descriptor_9 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      issueShares: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`issueShares: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const managerSk_0 = args_1[1];
        const investorPk_0 = args_1[2];
        const amount_0 = args_1[3];
        const salt_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('issueShares',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 56 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(managerSk_0.buffer instanceof ArrayBuffer && managerSk_0.BYTES_PER_ELEMENT === 1 && managerSk_0.length === 32)) {
          __compactRuntime.typeError('issueShares',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 56 char 1',
                                     'Bytes<32>',
                                     managerSk_0)
        }
        if (!(investorPk_0.buffer instanceof ArrayBuffer && investorPk_0.BYTES_PER_ELEMENT === 1 && investorPk_0.length === 32)) {
          __compactRuntime.typeError('issueShares',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 56 char 1',
                                     'Bytes<32>',
                                     investorPk_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('issueShares',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 56 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
          __compactRuntime.typeError('issueShares',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 56 char 1',
                                     'Bytes<32>',
                                     salt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(managerSk_0).concat(_descriptor_0.toValue(investorPk_0).concat(_descriptor_2.toValue(amount_0).concat(_descriptor_0.toValue(salt_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._issueShares_0(context,
                                             partialProofData,
                                             managerSk_0,
                                             investorPk_0,
                                             amount_0,
                                             salt_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      transferShares: (...args_1) => {
        if (args_1.length !== 8) {
          throw new __compactRuntime.CompactError(`transferShares: expected 8 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const senderSk_0 = args_1[1];
        const currentAmount_0 = args_1[2];
        const currentSalt_0 = args_1[3];
        const transferAmount_0 = args_1[4];
        const recipientPk_0 = args_1[5];
        const recipientSalt_0 = args_1[6];
        const changeSalt_0 = args_1[7];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('transferShares',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 95 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(senderSk_0.buffer instanceof ArrayBuffer && senderSk_0.BYTES_PER_ELEMENT === 1 && senderSk_0.length === 32)) {
          __compactRuntime.typeError('transferShares',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 95 char 1',
                                     'Bytes<32>',
                                     senderSk_0)
        }
        if (!(typeof(currentAmount_0) === 'bigint' && currentAmount_0 >= 0n && currentAmount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('transferShares',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 95 char 1',
                                     'Uint<0..18446744073709551616>',
                                     currentAmount_0)
        }
        if (!(currentSalt_0.buffer instanceof ArrayBuffer && currentSalt_0.BYTES_PER_ELEMENT === 1 && currentSalt_0.length === 32)) {
          __compactRuntime.typeError('transferShares',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 95 char 1',
                                     'Bytes<32>',
                                     currentSalt_0)
        }
        if (!(typeof(transferAmount_0) === 'bigint' && transferAmount_0 >= 0n && transferAmount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('transferShares',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 95 char 1',
                                     'Uint<0..18446744073709551616>',
                                     transferAmount_0)
        }
        if (!(recipientPk_0.buffer instanceof ArrayBuffer && recipientPk_0.BYTES_PER_ELEMENT === 1 && recipientPk_0.length === 32)) {
          __compactRuntime.typeError('transferShares',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 95 char 1',
                                     'Bytes<32>',
                                     recipientPk_0)
        }
        if (!(recipientSalt_0.buffer instanceof ArrayBuffer && recipientSalt_0.BYTES_PER_ELEMENT === 1 && recipientSalt_0.length === 32)) {
          __compactRuntime.typeError('transferShares',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 95 char 1',
                                     'Bytes<32>',
                                     recipientSalt_0)
        }
        if (!(changeSalt_0.buffer instanceof ArrayBuffer && changeSalt_0.BYTES_PER_ELEMENT === 1 && changeSalt_0.length === 32)) {
          __compactRuntime.typeError('transferShares',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 95 char 1',
                                     'Bytes<32>',
                                     changeSalt_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(senderSk_0).concat(_descriptor_2.toValue(currentAmount_0).concat(_descriptor_0.toValue(currentSalt_0).concat(_descriptor_2.toValue(transferAmount_0).concat(_descriptor_0.toValue(recipientPk_0).concat(_descriptor_0.toValue(recipientSalt_0).concat(_descriptor_0.toValue(changeSalt_0))))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._transferShares_0(context,
                                                partialProofData,
                                                senderSk_0,
                                                currentAmount_0,
                                                currentSalt_0,
                                                transferAmount_0,
                                                recipientPk_0,
                                                recipientSalt_0,
                                                changeSalt_0);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      proveShareThreshold: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`proveShareThreshold: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const ownerSk_0 = args_1[1];
        const amount_0 = args_1[2];
        const salt_0 = args_1[3];
        const threshold_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('proveShareThreshold',
                                     'argument 1 (as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 160 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(ownerSk_0.buffer instanceof ArrayBuffer && ownerSk_0.BYTES_PER_ELEMENT === 1 && ownerSk_0.length === 32)) {
          __compactRuntime.typeError('proveShareThreshold',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 160 char 1',
                                     'Bytes<32>',
                                     ownerSk_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveShareThreshold',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 160 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
          __compactRuntime.typeError('proveShareThreshold',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 160 char 1',
                                     'Bytes<32>',
                                     salt_0)
        }
        if (!(typeof(threshold_0) === 'bigint' && threshold_0 >= 0n && threshold_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveShareThreshold',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 160 char 1',
                                     'Uint<0..18446744073709551616>',
                                     threshold_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(ownerSk_0).concat(_descriptor_2.toValue(amount_0).concat(_descriptor_0.toValue(salt_0).concat(_descriptor_2.toValue(threshold_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_2.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._proveShareThreshold_0(context,
                                                     partialProofData,
                                                     ownerSk_0,
                                                     amount_0,
                                                     salt_0,
                                                     threshold_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      issueShares: this.circuits.issueShares,
      transferShares: this.circuits.transferShares,
      proveShareThreshold: this.circuits.proveShareThreshold
    };
    this.provableCircuits = {
      issueShares: this.circuits.issueShares,
      transferShares: this.circuits.transferShares,
      proveShareThreshold: this.circuits.proveShareThreshold
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const initialManager_0 = args_0[1];
    const initialPropertyId_0 = args_0[2];
    const authorizedShares_0 = args_0[3];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(initialManager_0.buffer instanceof ArrayBuffer && initialManager_0.BYTES_PER_ELEMENT === 1 && initialManager_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'private-fractional-real-estate-SPV-Cap-table.compact line 37 char 1',
                                 'Bytes<32>',
                                 initialManager_0)
    }
    if (!(initialPropertyId_0.buffer instanceof ArrayBuffer && initialPropertyId_0.BYTES_PER_ELEMENT === 1 && initialPropertyId_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 2 (argument 3 as invoked from Typescript)',
                                 'private-fractional-real-estate-SPV-Cap-table.compact line 37 char 1',
                                 'Bytes<32>',
                                 initialPropertyId_0)
    }
    if (!(typeof(authorizedShares_0) === 'bigint' && authorizedShares_0 >= 0n && authorizedShares_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 3 (argument 4 as invoked from Typescript)',
                                 'private-fractional-real-estate-SPV-Cap-table.compact line 37 char 1',
                                 'Uint<0..18446744073709551616>',
                                 authorizedShares_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('issueShares', new __compactRuntime.ContractOperation());
    state_0.setOperation('transferShares', new __compactRuntime.ContractOperation());
    state_0.setOperation('proveShareThreshold', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(0n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(1n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(2n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(3n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(4n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(5n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(0n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(initialManager_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(1n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(initialPropertyId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(2n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(authorizedShares_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(3n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(tmp_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_0, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_4, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_5, value_0);
    return result_0;
  }
  _issueShares_0(context,
                 partialProofData,
                 managerSk_0,
                 investorPk_0,
                 amount_0,
                 salt_0)
  {
    const derivedManagerPk_0 = this._persistentHash_0(managerSk_0);
    __compactRuntime.assert(this._equal_0(derivedManagerPk_0,
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_9.toValue(0n),
                                                                                                                                alignment: _descriptor_9.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Unauthorized: Only the SPV manager can issue shares');
    const newTotalIssued_0 = ((t1) => {
                               if (t1 > 18446744073709551615n) {
                                 throw new __compactRuntime.CompactError('private-fractional-real-estate-SPV-Cap-table.compact line 67 char 28: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                               }
                               return t1;
                             })(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                          partialProofData,
                                                                                          [
                                                                                           { dup: { n: 0 } },
                                                                                           { idx: { cached: false,
                                                                                                    pushPath: false,
                                                                                                    path: [
                                                                                                           { tag: 'value',
                                                                                                             value: { value: _descriptor_9.toValue(3n),
                                                                                                                      alignment: _descriptor_9.alignment() } }] } },
                                                                                           { popeq: { cached: false,
                                                                                                      result: undefined } }]).value)
                                +
                                amount_0);
    __compactRuntime.assert(newTotalIssued_0
                            <=
                            _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_9.toValue(2n),
                                                                                                                  alignment: _descriptor_9.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'Exceeds total authorized SPV shares');
    const holding_0 = { ownerPk: investorPk_0, amount: amount_0, salt: salt_0 };
    const commitment_0 = this._persistentHash_1(holding_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_9.toValue(4n),
                                                                  alignment: _descriptor_9.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(commitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_9.toValue(3n),
                                                                                              alignment: _descriptor_9.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(newTotalIssued_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return commitment_0;
  }
  _transferShares_0(context,
                    partialProofData,
                    senderSk_0,
                    currentAmount_0,
                    currentSalt_0,
                    transferAmount_0,
                    recipientPk_0,
                    recipientSalt_0,
                    changeSalt_0)
  {
    const senderPk_0 = this._persistentHash_0(senderSk_0);
    const existingHolding_0 = { ownerPk: senderPk_0,
                                amount: currentAmount_0,
                                salt: currentSalt_0 };
    const existingCommitment_0 = this._persistentHash_1(existingHolding_0);
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_9.toValue(4n),
                                                                                                                  alignment: _descriptor_9.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(existingCommitment_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Existing share commitment does not exist on-chain');
    const nullifierData_0 = { commitment: existingCommitment_0,
                              secretKey: senderSk_0 };
    const nullifier_0 = this._persistentHash_2(nullifierData_0);
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_9.toValue(5n),
                                                                                                                   alignment: _descriptor_9.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Share commitment has already been spent/transferred');
    __compactRuntime.assert(currentAmount_0 >= transferAmount_0,
                            'Insufficient fractional share balance');
    const changeAmount_0 = (__compactRuntime.assert(currentAmount_0
                                                    >=
                                                    transferAmount_0,
                                                    'result of subtraction would be negative'),
                            currentAmount_0 - transferAmount_0);
    const recipientHolding_0 = { ownerPk: recipientPk_0,
                                 amount: transferAmount_0,
                                 salt: recipientSalt_0 };
    const recipientCommitment_0 = this._persistentHash_1(recipientHolding_0);
    const changeHolding_0 = { ownerPk: senderPk_0,
                              amount: changeAmount_0,
                              salt: changeSalt_0 };
    const changeCommitment_0 = this._persistentHash_1(changeHolding_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_9.toValue(5n),
                                                                  alignment: _descriptor_9.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_9.toValue(4n),
                                                                  alignment: _descriptor_9.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(recipientCommitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_9.toValue(4n),
                                                                  alignment: _descriptor_9.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(changeCommitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return { recipientCommitment: recipientCommitment_0,
             changeCommitment: changeCommitment_0 };
  }
  _proveShareThreshold_0(context,
                         partialProofData,
                         ownerSk_0,
                         amount_0,
                         salt_0,
                         threshold_0)
  {
    const ownerPk_0 = this._persistentHash_0(ownerSk_0);
    const holding_0 = { ownerPk: ownerPk_0, amount: amount_0, salt: salt_0 };
    const commitment_0 = this._persistentHash_1(holding_0);
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_9.toValue(4n),
                                                                                                                  alignment: _descriptor_9.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(commitment_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Invalid or unregistered share commitment');
    const nullifierData_0 = { commitment: commitment_0, secretKey: ownerSk_0 };
    const nullifier_0 = this._persistentHash_2(nullifierData_0);
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_9.toValue(5n),
                                                                                                                   alignment: _descriptor_9.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nullifier_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Holding commitment has already been spent');
    __compactRuntime.assert(amount_0 >= threshold_0,
                            'Holding amount does not satisfy threshold requirement');
    return true;
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get manager() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_9.toValue(0n),
                                                                                                   alignment: _descriptor_9.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get propertyId() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_9.toValue(1n),
                                                                                                   alignment: _descriptor_9.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get totalAuthorizedShares() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_9.toValue(2n),
                                                                                                   alignment: _descriptor_9.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get totalIssuedShares() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_9.toValue(3n),
                                                                                                   alignment: _descriptor_9.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    commitments: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_9.toValue(4n),
                                                                                                     alignment: _descriptor_9.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_9.toValue(4n),
                                                                                                     alignment: _descriptor_9.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 29 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_9.toValue(4n),
                                                                                                     alignment: _descriptor_9.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    nullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_9.toValue(5n),
                                                                                                     alignment: _descriptor_9.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_9.toValue(5n),
                                                                                                     alignment: _descriptor_9.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'private-fractional-real-estate-SPV-Cap-table.compact line 30 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_9.toValue(5n),
                                                                                                     alignment: _descriptor_9.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[5];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
