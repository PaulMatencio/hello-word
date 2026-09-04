import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

class _UserPublicKey_0 {
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

const _descriptor_1 = new _UserPublicKey_0();

const _descriptor_2 = __compactRuntime.CompactTypeBoolean;

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_4 = __compactRuntime.CompactTypeOpaqueString;

class _UserSecretKey_0 {
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

const _descriptor_5 = new _UserSecretKey_0();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _AdminPublicKey_0 {
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

const _descriptor_7 = new _AdminPublicKey_0();

const _descriptor_8 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_2.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_9 = new _Either_0();

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

const _descriptor_10 = new _ContractAddress_0();

const _descriptor_11 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

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
    if (typeof(witnesses_0.getUserSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getUserSecret');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      MultiToken_deriveUserPublicKey(context, ...args_1) {
        return { result: pureCircuits.MultiToken_deriveUserPublicKey(...args_1), context };
      },
      MultiToken_deriveAdminPublicKey(context, ...args_1) {
        return { result: pureCircuits.MultiToken_deriveAdminPublicKey(...args_1), context };
      },
      initialize: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`initialize: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const _uri_2 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('initialize',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 48 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_4.toValue(_uri_2),
            alignment: _descriptor_4.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._initialize_2(context, partialProofData, _uri_2);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      uri: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`uri: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('uri',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 52 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('uri',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 52 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     id_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_3.toValue(id_0),
            alignment: _descriptor_3.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._uri_1(context, partialProofData, id_0);
        partialProofData.output = { value: _descriptor_4.toValue(result_0), alignment: _descriptor_4.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      balanceOf: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`balanceOf: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const account_0 = args_1[1];
        const id_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('balanceOf',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 56 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(account_0) === 'object' && account_0.bytes.buffer instanceof ArrayBuffer && account_0.bytes.BYTES_PER_ELEMENT === 1 && account_0.bytes.length === 32)) {
          __compactRuntime.typeError('balanceOf',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 56 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     account_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('balanceOf',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 56 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     id_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(account_0).concat(_descriptor_3.toValue(id_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_3.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._balanceOf_1(context,
                                           partialProofData,
                                           account_0,
                                           id_0);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      isApprovedForAll: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`isApprovedForAll: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const account_0 = args_1[1];
        const operator_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('isApprovedForAll',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 60 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(account_0) === 'object' && account_0.bytes.buffer instanceof ArrayBuffer && account_0.bytes.BYTES_PER_ELEMENT === 1 && account_0.bytes.length === 32)) {
          __compactRuntime.typeError('isApprovedForAll',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 60 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     account_0)
        }
        if (!(typeof(operator_0) === 'object' && operator_0.bytes.buffer instanceof ArrayBuffer && operator_0.bytes.BYTES_PER_ELEMENT === 1 && operator_0.bytes.length === 32)) {
          __compactRuntime.typeError('isApprovedForAll',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 60 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     operator_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(account_0).concat(_descriptor_1.toValue(operator_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._isApprovedForAll_1(context,
                                                  partialProofData,
                                                  account_0,
                                                  operator_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      setApprovalForAll: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`setApprovalForAll: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const operator_0 = args_1[1];
        const approved_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('setApprovalForAll',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 67 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(operator_0) === 'object' && operator_0.bytes.buffer instanceof ArrayBuffer && operator_0.bytes.BYTES_PER_ELEMENT === 1 && operator_0.bytes.length === 32)) {
          __compactRuntime.typeError('setApprovalForAll',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 67 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     operator_0)
        }
        if (!(typeof(approved_0) === 'boolean')) {
          __compactRuntime.typeError('setApprovalForAll',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 67 char 1',
                                     'Boolean',
                                     approved_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(operator_0).concat(_descriptor_2.toValue(approved_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._setApprovalForAll_1(context,
                                                   partialProofData,
                                                   operator_0,
                                                   approved_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      transfer: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`transfer: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const to_0 = args_1[1];
        const id_0 = args_1[2];
        const value_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('transfer',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 75 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(to_0) === 'object' && to_0.bytes.buffer instanceof ArrayBuffer && to_0.bytes.BYTES_PER_ELEMENT === 1 && to_0.bytes.length === 32)) {
          __compactRuntime.typeError('transfer',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 75 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     to_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('transfer',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 75 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     id_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('transfer',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 75 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(to_0).concat(_descriptor_3.toValue(id_0).concat(_descriptor_3.toValue(value_0))),
            alignment: _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._transfer_0(context,
                                          partialProofData,
                                          to_0,
                                          id_0,
                                          value_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      transferFromAuthorized: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`transferFromAuthorized: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const fromAddress_0 = args_1[1];
        const to_0 = args_1[2];
        const id_0 = args_1[3];
        const value_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('transferFromAuthorized',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 84 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(fromAddress_0) === 'object' && fromAddress_0.bytes.buffer instanceof ArrayBuffer && fromAddress_0.bytes.BYTES_PER_ELEMENT === 1 && fromAddress_0.bytes.length === 32)) {
          __compactRuntime.typeError('transferFromAuthorized',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 84 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     fromAddress_0)
        }
        if (!(typeof(to_0) === 'object' && to_0.bytes.buffer instanceof ArrayBuffer && to_0.bytes.BYTES_PER_ELEMENT === 1 && to_0.bytes.length === 32)) {
          __compactRuntime.typeError('transferFromAuthorized',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 84 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     to_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('transferFromAuthorized',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 84 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     id_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('transferFromAuthorized',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 84 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(fromAddress_0).concat(_descriptor_1.toValue(to_0).concat(_descriptor_3.toValue(id_0).concat(_descriptor_3.toValue(value_0)))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._transferFromAuthorized_0(context,
                                                        partialProofData,
                                                        fromAddress_0,
                                                        to_0,
                                                        id_0,
                                                        value_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      _transfer: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`_transfer: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const fromAddress_0 = args_1[1];
        const to_0 = args_1[2];
        const id_0 = args_1[3];
        const value_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('_transfer',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 94 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(fromAddress_0) === 'object' && fromAddress_0.bytes.buffer instanceof ArrayBuffer && fromAddress_0.bytes.BYTES_PER_ELEMENT === 1 && fromAddress_0.bytes.length === 32)) {
          __compactRuntime.typeError('_transfer',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 94 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     fromAddress_0)
        }
        if (!(typeof(to_0) === 'object' && to_0.bytes.buffer instanceof ArrayBuffer && to_0.bytes.BYTES_PER_ELEMENT === 1 && to_0.bytes.length === 32)) {
          __compactRuntime.typeError('_transfer',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 94 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     to_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('_transfer',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 94 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     id_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('_transfer',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 94 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(fromAddress_0).concat(_descriptor_1.toValue(to_0).concat(_descriptor_3.toValue(id_0).concat(_descriptor_3.toValue(value_0)))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.__transfer_1(context,
                                           partialProofData,
                                           fromAddress_0,
                                           to_0,
                                           id_0,
                                           value_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      _setURI: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`_setURI: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const newURI_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('_setURI',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 103 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_4.toValue(newURI_0),
            alignment: _descriptor_4.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.__setURI_1(context, partialProofData, newURI_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      _mint: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`_mint: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const to_0 = args_1[1];
        const id_0 = args_1[2];
        const value_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('_mint',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 107 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(to_0) === 'object' && to_0.bytes.buffer instanceof ArrayBuffer && to_0.bytes.BYTES_PER_ELEMENT === 1 && to_0.bytes.length === 32)) {
          __compactRuntime.typeError('_mint',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 107 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     to_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('_mint',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 107 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     id_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('_mint',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 107 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(to_0).concat(_descriptor_3.toValue(id_0).concat(_descriptor_3.toValue(value_0))),
            alignment: _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.__mint_1(context,
                                       partialProofData,
                                       to_0,
                                       id_0,
                                       value_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      _burn: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`_burn: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const fromAddress_0 = args_1[1];
        const id_0 = args_1[2];
        const value_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('_burn',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 115 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(fromAddress_0) === 'object' && fromAddress_0.bytes.buffer instanceof ArrayBuffer && fromAddress_0.bytes.BYTES_PER_ELEMENT === 1 && fromAddress_0.bytes.length === 32)) {
          __compactRuntime.typeError('_burn',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 115 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     fromAddress_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('_burn',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 115 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     id_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('_burn',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 115 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(fromAddress_0).concat(_descriptor_3.toValue(id_0).concat(_descriptor_3.toValue(value_0))),
            alignment: _descriptor_1.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.__burn_1(context,
                                       partialProofData,
                                       fromAddress_0,
                                       id_0,
                                       value_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      _setApprovalForAll: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`_setApprovalForAll: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const owner_0 = args_1[1];
        const operator_0 = args_1[2];
        const approved_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('_setApprovalForAll',
                                     'argument 1 (as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 123 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(owner_0) === 'object' && owner_0.bytes.buffer instanceof ArrayBuffer && owner_0.bytes.BYTES_PER_ELEMENT === 1 && owner_0.bytes.length === 32)) {
          __compactRuntime.typeError('_setApprovalForAll',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 123 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     owner_0)
        }
        if (!(typeof(operator_0) === 'object' && operator_0.bytes.buffer instanceof ArrayBuffer && operator_0.bytes.BYTES_PER_ELEMENT === 1 && operator_0.bytes.length === 32)) {
          __compactRuntime.typeError('_setApprovalForAll',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 123 char 1',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     operator_0)
        }
        if (!(typeof(approved_0) === 'boolean')) {
          __compactRuntime.typeError('_setApprovalForAll',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'contracts/MultiToken.compact line 123 char 1',
                                     'Boolean',
                                     approved_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(owner_0).concat(_descriptor_1.toValue(operator_0).concat(_descriptor_2.toValue(approved_0))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.__setApprovalForAll_1(context,
                                                    partialProofData,
                                                    owner_0,
                                                    operator_0,
                                                    approved_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      initialize: this.circuits.initialize,
      uri: this.circuits.uri,
      balanceOf: this.circuits.balanceOf,
      isApprovedForAll: this.circuits.isApprovedForAll,
      setApprovalForAll: this.circuits.setApprovalForAll,
      transfer: this.circuits.transfer,
      transferFromAuthorized: this.circuits.transferFromAuthorized,
      _transfer: this.circuits._transfer,
      _setURI: this.circuits._setURI,
      _mint: this.circuits._mint,
      _burn: this.circuits._burn,
      _setApprovalForAll: this.circuits._setApprovalForAll
    };
    this.provableCircuits = {
      initialize: this.circuits.initialize,
      uri: this.circuits.uri,
      balanceOf: this.circuits.balanceOf,
      isApprovedForAll: this.circuits.isApprovedForAll,
      setApprovalForAll: this.circuits.setApprovalForAll,
      transfer: this.circuits.transfer,
      transferFromAuthorized: this.circuits.transferFromAuthorized,
      _transfer: this.circuits._transfer,
      _setURI: this.circuits._setURI,
      _mint: this.circuits._mint,
      _burn: this.circuits._burn,
      _setApprovalForAll: this.circuits._setApprovalForAll
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const _uri_2 = args_0[1];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(typeof(_uri_2) === 'object' && typeof(_uri_2.is_some) === 'boolean' && true)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'contracts/MultiToken.compact line 41 char 1',
                                 'struct Maybe<is_some: Boolean, value: Opaque<"string">>',
                                 _uri_2)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('initialize', new __compactRuntime.ContractOperation());
    state_0.setOperation('uri', new __compactRuntime.ContractOperation());
    state_0.setOperation('balanceOf', new __compactRuntime.ContractOperation());
    state_0.setOperation('isApprovedForAll', new __compactRuntime.ContractOperation());
    state_0.setOperation('setApprovalForAll', new __compactRuntime.ContractOperation());
    state_0.setOperation('transfer', new __compactRuntime.ContractOperation());
    state_0.setOperation('transferFromAuthorized', new __compactRuntime.ContractOperation());
    state_0.setOperation('_transfer', new __compactRuntime.ContractOperation());
    state_0.setOperation('_setURI', new __compactRuntime.ContractOperation());
    state_0.setOperation('_mint', new __compactRuntime.ContractOperation());
    state_0.setOperation('_burn', new __compactRuntime.ContractOperation());
    state_0.setOperation('_setApprovalForAll', new __compactRuntime.ContractOperation());
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
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_11.toValue(0n),
                                                                                              alignment: _descriptor_11.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_11.toValue(1n),
                                                                                              alignment: _descriptor_11.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_11.toValue(2n),
                                                                                              alignment: _descriptor_11.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(''),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_11.toValue(3n),
                                                                                              alignment: _descriptor_11.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(false),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_11.toValue(4n),
                                                                                              alignment: _descriptor_11.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue({ bytes: new Uint8Array(32) }),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    if (_uri_2.is_some) {
      this._initialize_0(context, partialProofData, _uri_2.value);
    }
    const tmp_0 = this._deriveAdminPublicKey_0(this._getUserSecret_0(context,
                                                                     partialProofData));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_11.toValue(4n),
                                                                                              alignment: _descriptor_11.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_7.toValue(tmp_0),
                                                                                              alignment: _descriptor_7.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_8, value_0);
    return result_0;
  }
  _deriveUserPublicKey_0(sk_0) {
    return { bytes:
               this._persistentHash_0([new Uint8Array([109, 117, 108, 116, 105, 116, 111, 107, 101, 110, 58, 117, 115, 101, 114, 58, 112, 107, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                       sk_0.bytes]) };
  }
  _deriveAdminPublicKey_0(sk_0) {
    return { bytes:
               this._persistentHash_0([new Uint8Array([109, 117, 108, 116, 105, 116, 111, 107, 101, 110, 58, 97, 100, 109, 105, 110, 58, 112, 107, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                       sk_0.bytes]) };
  }
  _initialize_0(context, partialProofData, uri__0) {
    this._initialize_1(context, partialProofData);
    this.__setURI_0(context, partialProofData, uri__0);
    return [];
  }
  _uri_0(context, partialProofData, id_0) {
    this._assertInitialized_0(context, partialProofData);
    return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_11.toValue(2n),
                                                                                                 alignment: _descriptor_11.alignment() } }] } },
                                                                      { popeq: { cached: false,
                                                                                 result: undefined } }]).value);
  }
  _balanceOf_0(context, partialProofData, account_0, id_0) {
    this._assertInitialized_0(context, partialProofData);
    if (!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_11.toValue(0n),
                                                                                               alignment: _descriptor_11.alignment() } }] } },
                                                                    { push: { storage: false,
                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(id_0),
                                                                                                                           alignment: _descriptor_3.alignment() }).encode() } },
                                                                    'member',
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value)
        ||
        !_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_11.toValue(0n),
                                                                                               alignment: _descriptor_11.alignment() } },
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_3.toValue(id_0),
                                                                                               alignment: _descriptor_3.alignment() } }] } },
                                                                    { push: { storage: false,
                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(account_0),
                                                                                                                           alignment: _descriptor_1.alignment() }).encode() } },
                                                                    'member',
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value))
    {
      return 0n;
    } else {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_11.toValue(0n),
                                                                                                   alignment: _descriptor_11.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_3.toValue(id_0),
                                                                                                   alignment: _descriptor_3.alignment() } }] } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_1.toValue(account_0),
                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  }
  _setApprovalForAll_0(context,
                       partialProofData,
                       caller_0,
                       operator_0,
                       approved_0)
  {
    this._assertInitialized_0(context, partialProofData);
    this.__setApprovalForAll_0(context,
                               partialProofData,
                               caller_0,
                               operator_0,
                               approved_0);
    return [];
  }
  _isApprovedForAll_0(context, partialProofData, account_0, operator_0) {
    this._assertInitialized_0(context, partialProofData);
    if (!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_11.toValue(1n),
                                                                                               alignment: _descriptor_11.alignment() } }] } },
                                                                    { push: { storage: false,
                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(account_0),
                                                                                                                           alignment: _descriptor_1.alignment() }).encode() } },
                                                                    'member',
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value)
        ||
        !_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_11.toValue(1n),
                                                                                               alignment: _descriptor_11.alignment() } },
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_1.toValue(account_0),
                                                                                               alignment: _descriptor_1.alignment() } }] } },
                                                                    { push: { storage: false,
                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(operator_0),
                                                                                                                           alignment: _descriptor_1.alignment() }).encode() } },
                                                                    'member',
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value))
    {
      return false;
    } else {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_11.toValue(1n),
                                                                                                   alignment: _descriptor_11.alignment() } },
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_1.toValue(account_0),
                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_1.toValue(operator_0),
                                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  }
  _transferFrom_0(context,
                  partialProofData,
                  caller_0,
                  fromAddress_0,
                  to_0,
                  id_0,
                  value_0)
  {
    this._assertInitialized_0(context, partialProofData);
    if (!this._equal_0(fromAddress_0, caller_0)) {
      __compactRuntime.assert(this._isApprovedForAll_0(context,
                                                       partialProofData,
                                                       fromAddress_0,
                                                       caller_0),
                              'MultiToken: unauthorized operator');
    }
    this.__transfer_0(context,
                      partialProofData,
                      fromAddress_0,
                      to_0,
                      id_0,
                      value_0);
    return [];
  }
  __transfer_0(context, partialProofData, fromAddress_0, to_0, id_0, value_0) {
    this._assertInitialized_0(context, partialProofData);
    __compactRuntime.assert(!this._equal_1(fromAddress_0,
                                           { bytes: new Uint8Array(32) }),
                            'MultiToken: invalid sender');
    __compactRuntime.assert(!this._equal_2(to_0, { bytes: new Uint8Array(32) }),
                            'MultiToken: invalid receiver');
    this.__update_0(context,
                    partialProofData,
                    fromAddress_0,
                    to_0,
                    id_0,
                    value_0);
    return [];
  }
  __update_0(context, partialProofData, fromAddress_0, to_0, id_0, value_0) {
    this._assertInitialized_0(context, partialProofData);
    if (!this._equal_3(fromAddress_0, { bytes: new Uint8Array(32) })) {
      const fromBalance_0 = this._balanceOf_0(context,
                                              partialProofData,
                                              fromAddress_0,
                                              id_0);
      __compactRuntime.assert(fromBalance_0 >= value_0,
                              'MultiToken: insufficient balance');
      const newBalance_0 = (__compactRuntime.assert(fromBalance_0 >= value_0,
                                                    'result of subtraction would be negative'),
                            fromBalance_0 - value_0);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_11.toValue(0n),
                                                                    alignment: _descriptor_11.alignment() } },
                                                         { tag: 'value',
                                                           value: { value: _descriptor_3.toValue(id_0),
                                                                    alignment: _descriptor_3.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(fromAddress_0),
                                                                                                alignment: _descriptor_1.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(newBalance_0),
                                                                                                alignment: _descriptor_3.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 2 } }]);
    }
    if (!this._equal_4(to_0, { bytes: new Uint8Array(32) })) {
      if (!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 0 } },
                                                                      { idx: { cached: false,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_11.toValue(0n),
                                                                                                 alignment: _descriptor_11.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(id_0),
                                                                                                                             alignment: _descriptor_3.alignment() }).encode() } },
                                                                      'member',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value))
      {
        __compactRuntime.queryLedgerState(context,
                                          partialProofData,
                                          [
                                           { idx: { cached: false,
                                                    pushPath: true,
                                                    path: [
                                                           { tag: 'value',
                                                             value: { value: _descriptor_11.toValue(0n),
                                                                      alignment: _descriptor_11.alignment() } }] } },
                                           { push: { storage: false,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(id_0),
                                                                                                  alignment: _descriptor_3.alignment() }).encode() } },
                                           { push: { storage: true,
                                                     value: __compactRuntime.StateValue.newMap(
                                                              new __compactRuntime.StateMap()
                                                            ).encode() } },
                                           { ins: { cached: false, n: 1 } },
                                           { ins: { cached: true, n: 1 } }]);
        __compactRuntime.queryLedgerState(context,
                                          partialProofData,
                                          [
                                           { idx: { cached: false,
                                                    pushPath: true,
                                                    path: [
                                                           { tag: 'value',
                                                             value: { value: _descriptor_11.toValue(0n),
                                                                      alignment: _descriptor_11.alignment() } },
                                                           { tag: 'value',
                                                             value: { value: _descriptor_3.toValue(id_0),
                                                                      alignment: _descriptor_3.alignment() } }] } },
                                           { push: { storage: false,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(to_0),
                                                                                                  alignment: _descriptor_1.alignment() }).encode() } },
                                           { push: { storage: true,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(value_0),
                                                                                                  alignment: _descriptor_3.alignment() }).encode() } },
                                           { ins: { cached: false, n: 1 } },
                                           { ins: { cached: true, n: 2 } }]);
      } else {
        const toBalance_0 = this._balanceOf_0(context,
                                              partialProofData,
                                              to_0,
                                              id_0);
        const MAX_UINT128_0 = 340282366920938463463374607431768211455n;
        let t_0;
        __compactRuntime.assert((t_0 = (__compactRuntime.assert(MAX_UINT128_0
                                                                >=
                                                                toBalance_0,
                                                                'result of subtraction would be negative'),
                                        MAX_UINT128_0 - toBalance_0),
                                 t_0 >= value_0),
                                'MultiToken: arithmetic overflow');
        const tmp_0 = ((t1) => {
                        if (t1 > 340282366920938463463374607431768211455n) {
                          throw new __compactRuntime.CompactError('contracts/./modules/token/MultiToken.compact line 400 char 60: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
                        }
                        return t1;
                      })(toBalance_0 + value_0);
        __compactRuntime.queryLedgerState(context,
                                          partialProofData,
                                          [
                                           { idx: { cached: false,
                                                    pushPath: true,
                                                    path: [
                                                           { tag: 'value',
                                                             value: { value: _descriptor_11.toValue(0n),
                                                                      alignment: _descriptor_11.alignment() } },
                                                           { tag: 'value',
                                                             value: { value: _descriptor_3.toValue(id_0),
                                                                      alignment: _descriptor_3.alignment() } }] } },
                                           { push: { storage: false,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(to_0),
                                                                                                  alignment: _descriptor_1.alignment() }).encode() } },
                                           { push: { storage: true,
                                                     value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_0),
                                                                                                  alignment: _descriptor_3.alignment() }).encode() } },
                                           { ins: { cached: false, n: 1 } },
                                           { ins: { cached: true, n: 2 } }]);
      }
    }
    return [];
  }
  __setURI_0(context, partialProofData, newURI_0) {
    this._assertInitialized_0(context, partialProofData);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_11.toValue(2n),
                                                                                              alignment: _descriptor_11.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(newURI_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  __mint_0(context, partialProofData, to_0, id_0, value_0) {
    this._assertInitialized_0(context, partialProofData);
    __compactRuntime.assert(!this._equal_5(to_0, { bytes: new Uint8Array(32) }),
                            'MultiToken: invalid receiver');
    this.__update_0(context,
                    partialProofData,
                    { bytes: new Uint8Array(32) },
                    to_0,
                    id_0,
                    value_0);
    return [];
  }
  __burn_0(context, partialProofData, fromAddress_0, id_0, value_0) {
    this._assertInitialized_0(context, partialProofData);
    __compactRuntime.assert(!this._equal_6(fromAddress_0,
                                           { bytes: new Uint8Array(32) }),
                            'MultiToken: invalid sender');
    this.__update_0(context,
                    partialProofData,
                    fromAddress_0,
                    { bytes: new Uint8Array(32) },
                    id_0,
                    value_0);
    return [];
  }
  __setApprovalForAll_0(context,
                        partialProofData,
                        owner_0,
                        operator_0,
                        approved_0)
  {
    this._assertInitialized_0(context, partialProofData);
    __compactRuntime.assert(!this._equal_7(operator_0,
                                           { bytes: new Uint8Array(32) }),
                            'MultiToken: invalid operator');
    if (!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_11.toValue(1n),
                                                                                               alignment: _descriptor_11.alignment() } }] } },
                                                                    { push: { storage: false,
                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(owner_0),
                                                                                                                           alignment: _descriptor_1.alignment() }).encode() } },
                                                                    'member',
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value))
    {
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_11.toValue(1n),
                                                                    alignment: _descriptor_11.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(owner_0),
                                                                                                alignment: _descriptor_1.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newMap(
                                                            new __compactRuntime.StateMap()
                                                          ).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 1 } }]);
    }
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_11.toValue(1n),
                                                                  alignment: _descriptor_11.alignment() } },
                                                       { tag: 'value',
                                                         value: { value: _descriptor_1.toValue(owner_0),
                                                                  alignment: _descriptor_1.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(operator_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(approved_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _initialize_1(context, partialProofData) {
    this._assertNotInitialized_0(context, partialProofData);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_11.toValue(3n),
                                                                                              alignment: _descriptor_11.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(true),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _assertInitialized_0(context, partialProofData) {
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_11.toValue(3n),
                                                                                                                  alignment: _descriptor_11.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'Initializable: contract not initialized');
    return [];
  }
  _assertNotInitialized_0(context, partialProofData) {
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_11.toValue(3n),
                                                                                                                   alignment: _descriptor_11.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value),
                            'Initializable: contract already initialized');
    return [];
  }
  _getUserSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getUserSecret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.bytes.buffer instanceof ArrayBuffer && result_0.bytes.BYTES_PER_ELEMENT === 1 && result_0.bytes.length === 32)) {
      __compactRuntime.typeError('getUserSecret',
                                 'return value',
                                 'contracts/MultiToken.compact line 32 char 1',
                                 'struct UserSecretKey<bytes: Bytes<32>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_5.toValue(result_0),
      alignment: _descriptor_5.alignment()
    });
    return result_0;
  }
  _initialize_2(context, partialProofData, _uri_2) {
    return this._initialize_0(context, partialProofData, _uri_2);
  }
  _uri_1(context, partialProofData, id_0) {
    return this._uri_0(context, partialProofData, id_0);
  }
  _balanceOf_1(context, partialProofData, account_0, id_0) {
    return this._balanceOf_0(context, partialProofData, account_0, id_0);
  }
  _isApprovedForAll_1(context, partialProofData, account_0, operator_0) {
    return this._isApprovedForAll_0(context,
                                    partialProofData,
                                    account_0,
                                    operator_0);
  }
  _setApprovalForAll_1(context, partialProofData, operator_0, approved_0) {
    const caller_0 = this._deriveUserPublicKey_0(this._getUserSecret_0(context,
                                                                       partialProofData));
    this._setApprovalForAll_0(context,
                              partialProofData,
                              caller_0,
                              operator_0,
                              approved_0);
    return [];
  }
  _transfer_0(context, partialProofData, to_0, id_0, value_0) {
    const caller_0 = this._deriveUserPublicKey_0(this._getUserSecret_0(context,
                                                                       partialProofData));
    this._transferFrom_0(context,
                         partialProofData,
                         caller_0,
                         caller_0,
                         to_0,
                         id_0,
                         value_0);
    return [];
  }
  _transferFromAuthorized_0(context,
                            partialProofData,
                            fromAddress_0,
                            to_0,
                            id_0,
                            value_0)
  {
    const caller_0 = this._deriveUserPublicKey_0(this._getUserSecret_0(context,
                                                                       partialProofData));
    this._transferFrom_0(context,
                         partialProofData,
                         caller_0,
                         fromAddress_0,
                         to_0,
                         id_0,
                         value_0);
    return [];
  }
  __transfer_1(context, partialProofData, fromAddress_0, to_0, id_0, value_0) {
    this.__transfer_0(context,
                      partialProofData,
                      fromAddress_0,
                      to_0,
                      id_0,
                      value_0);
    return [];
  }
  __setURI_1(context, partialProofData, newURI_0) {
    this.__setURI_0(context, partialProofData, newURI_0); return [];
  }
  __mint_1(context, partialProofData, to_0, id_0, value_0) {
    this.__mint_0(context, partialProofData, to_0, id_0, value_0); return [];
  }
  __burn_1(context, partialProofData, fromAddress_0, id_0, value_0) {
    this.__burn_0(context, partialProofData, fromAddress_0, id_0, value_0);
    return [];
  }
  __setApprovalForAll_1(context,
                        partialProofData,
                        owner_0,
                        operator_0,
                        approved_0)
  {
    this.__setApprovalForAll_0(context,
                               partialProofData,
                               owner_0,
                               operator_0,
                               approved_0);
    return [];
  }
  _equal_0(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_1(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_2(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_3(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_4(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_5(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_6(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
    return true;
  }
  _equal_7(x0, y0) {
    {
      let x1 = x0.bytes;
      let y1 = y0.bytes;
      if (!x1.every((x, i) => y1[i] === x)) { return false; }
    }
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
    MultiToken__balances: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_11.toValue(0n),
                                                                                                     alignment: _descriptor_11.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                 alignment: _descriptor_6.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_11.toValue(0n),
                                                                                                     alignment: _descriptor_11.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'contracts/./modules/token/MultiToken.compact line 123 char 3',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_11.toValue(0n),
                                                                                                     alignment: _descriptor_11.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(key_0),
                                                                                                                                 alignment: _descriptor_3.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'contracts/./modules/token/MultiToken.compact line 123 char 3',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     key_0)
        }
        if (state.asArray()[0].asMap().get({ value: _descriptor_3.toValue(key_0),
                                             alignment: _descriptor_3.alignment() }) === undefined) {
          throw new __compactRuntime.CompactError(`Map value undefined for ${key_0}`);
        }
        return {
          isEmpty(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_11.toValue(0n),
                                                                                                         alignment: _descriptor_11.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_3.toValue(key_0),
                                                                                                         alignment: _descriptor_3.alignment() } }] } },
                                                                              'size',
                                                                              { push: { storage: false,
                                                                                        value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                     alignment: _descriptor_6.alignment() }).encode() } },
                                                                              'eq',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          size(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_11.toValue(0n),
                                                                                                         alignment: _descriptor_11.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_3.toValue(key_0),
                                                                                                         alignment: _descriptor_3.alignment() } }] } },
                                                                              'size',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          member(...args_1) {
            if (args_1.length !== 1) {
              throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_1.length}`);
            }
            const key_1 = args_1[0];
            if (!(typeof(key_1) === 'object' && key_1.bytes.buffer instanceof ArrayBuffer && key_1.bytes.BYTES_PER_ELEMENT === 1 && key_1.bytes.length === 32)) {
              __compactRuntime.typeError('member',
                                         'argument 1',
                                         'contracts/./modules/token/MultiToken.compact line 123 char 43',
                                         'struct UserPublicKey<bytes: Bytes<32>>',
                                         key_1)
            }
            return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_11.toValue(0n),
                                                                                                         alignment: _descriptor_11.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_3.toValue(key_0),
                                                                                                         alignment: _descriptor_3.alignment() } }] } },
                                                                              { push: { storage: false,
                                                                                        value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_1),
                                                                                                                                     alignment: _descriptor_1.alignment() }).encode() } },
                                                                              'member',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          lookup(...args_1) {
            if (args_1.length !== 1) {
              throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_1.length}`);
            }
            const key_1 = args_1[0];
            if (!(typeof(key_1) === 'object' && key_1.bytes.buffer instanceof ArrayBuffer && key_1.bytes.BYTES_PER_ELEMENT === 1 && key_1.bytes.length === 32)) {
              __compactRuntime.typeError('lookup',
                                         'argument 1',
                                         'contracts/./modules/token/MultiToken.compact line 123 char 43',
                                         'struct UserPublicKey<bytes: Bytes<32>>',
                                         key_1)
            }
            return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_11.toValue(0n),
                                                                                                         alignment: _descriptor_11.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_3.toValue(key_0),
                                                                                                         alignment: _descriptor_3.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(key_1),
                                                                                                         alignment: _descriptor_1.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
          },
          [Symbol.iterator](...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_1.length}`);
            }
            const self_0 = state.asArray()[0].asMap().get({ value: _descriptor_3.toValue(key_0),
                                                            alignment: _descriptor_3.alignment() });
            return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
          }
        }
      }
    },
    MultiToken__operatorApprovals: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_11.toValue(1n),
                                                                                                     alignment: _descriptor_11.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                 alignment: _descriptor_6.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_11.toValue(1n),
                                                                                                     alignment: _descriptor_11.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.bytes.buffer instanceof ArrayBuffer && key_0.bytes.BYTES_PER_ELEMENT === 1 && key_0.bytes.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'contracts/./modules/token/MultiToken.compact line 133 char 3',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_11.toValue(1n),
                                                                                                     alignment: _descriptor_11.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_0),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.bytes.buffer instanceof ArrayBuffer && key_0.bytes.BYTES_PER_ELEMENT === 1 && key_0.bytes.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'contracts/./modules/token/MultiToken.compact line 133 char 3',
                                     'struct UserPublicKey<bytes: Bytes<32>>',
                                     key_0)
        }
        if (state.asArray()[1].asMap().get({ value: _descriptor_1.toValue(key_0),
                                             alignment: _descriptor_1.alignment() }) === undefined) {
          throw new __compactRuntime.CompactError(`Map value undefined for ${key_0}`);
        }
        return {
          isEmpty(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_11.toValue(1n),
                                                                                                         alignment: _descriptor_11.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(key_0),
                                                                                                         alignment: _descriptor_1.alignment() } }] } },
                                                                              'size',
                                                                              { push: { storage: false,
                                                                                        value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                     alignment: _descriptor_6.alignment() }).encode() } },
                                                                              'eq',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          size(...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_1.length}`);
            }
            return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_11.toValue(1n),
                                                                                                         alignment: _descriptor_11.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(key_0),
                                                                                                         alignment: _descriptor_1.alignment() } }] } },
                                                                              'size',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          member(...args_1) {
            if (args_1.length !== 1) {
              throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_1.length}`);
            }
            const key_1 = args_1[0];
            if (!(typeof(key_1) === 'object' && key_1.bytes.buffer instanceof ArrayBuffer && key_1.bytes.BYTES_PER_ELEMENT === 1 && key_1.bytes.length === 32)) {
              __compactRuntime.typeError('member',
                                         'argument 1',
                                         'contracts/./modules/token/MultiToken.compact line 133 char 56',
                                         'struct UserPublicKey<bytes: Bytes<32>>',
                                         key_1)
            }
            return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_11.toValue(1n),
                                                                                                         alignment: _descriptor_11.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(key_0),
                                                                                                         alignment: _descriptor_1.alignment() } }] } },
                                                                              { push: { storage: false,
                                                                                        value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_1),
                                                                                                                                     alignment: _descriptor_1.alignment() }).encode() } },
                                                                              'member',
                                                                              { popeq: { cached: true,
                                                                                         result: undefined } }]).value);
          },
          lookup(...args_1) {
            if (args_1.length !== 1) {
              throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_1.length}`);
            }
            const key_1 = args_1[0];
            if (!(typeof(key_1) === 'object' && key_1.bytes.buffer instanceof ArrayBuffer && key_1.bytes.BYTES_PER_ELEMENT === 1 && key_1.bytes.length === 32)) {
              __compactRuntime.typeError('lookup',
                                         'argument 1',
                                         'contracts/./modules/token/MultiToken.compact line 133 char 56',
                                         'struct UserPublicKey<bytes: Bytes<32>>',
                                         key_1)
            }
            return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                             partialProofData,
                                                                             [
                                                                              { dup: { n: 0 } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_11.toValue(1n),
                                                                                                         alignment: _descriptor_11.alignment() } },
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(key_0),
                                                                                                         alignment: _descriptor_1.alignment() } }] } },
                                                                              { idx: { cached: false,
                                                                                       pushPath: false,
                                                                                       path: [
                                                                                              { tag: 'value',
                                                                                                value: { value: _descriptor_1.toValue(key_1),
                                                                                                         alignment: _descriptor_1.alignment() } }] } },
                                                                              { popeq: { cached: false,
                                                                                         result: undefined } }]).value);
          },
          [Symbol.iterator](...args_1) {
            if (args_1.length !== 0) {
              throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_1.length}`);
            }
            const self_0 = state.asArray()[1].asMap().get({ value: _descriptor_1.toValue(key_0),
                                                            alignment: _descriptor_1.alignment() });
            return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_2.fromValue(value.value)    ];  })[Symbol.iterator]();
          }
        }
      }
    },
    get MultiToken__uri() {
      return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_11.toValue(2n),
                                                                                                   alignment: _descriptor_11.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get contractAdmin() {
      return _descriptor_7.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_11.toValue(4n),
                                                                                                   alignment: _descriptor_11.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ getUserSecret: (...args) => undefined });
export const pureCircuits = {
  MultiToken_deriveUserPublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`MultiToken_deriveUserPublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(typeof(sk_0) === 'object' && sk_0.bytes.buffer instanceof ArrayBuffer && sk_0.bytes.BYTES_PER_ELEMENT === 1 && sk_0.bytes.length === 32)) {
      __compactRuntime.typeError('MultiToken_deriveUserPublicKey',
                                 'argument 1',
                                 'contracts/./modules/token/MultiToken.compact line 100 char 3',
                                 'struct UserSecretKey<bytes: Bytes<32>>',
                                 sk_0)
    }
    return _dummyContract._deriveUserPublicKey_0(sk_0);
  },
  MultiToken_deriveAdminPublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`MultiToken_deriveAdminPublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(typeof(sk_0) === 'object' && sk_0.bytes.buffer instanceof ArrayBuffer && sk_0.bytes.BYTES_PER_ELEMENT === 1 && sk_0.bytes.length === 32)) {
      __compactRuntime.typeError('MultiToken_deriveAdminPublicKey',
                                 'argument 1',
                                 'contracts/./modules/token/MultiToken.compact line 109 char 3',
                                 'struct UserSecretKey<bytes: Bytes<32>>',
                                 sk_0)
    }
    return _dummyContract._deriveAdminPublicKey_0(sk_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
