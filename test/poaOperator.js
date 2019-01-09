
/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License, version 2,
 * found in the LICENSE file in the root directory of this source tree.
 */

import EVMRevert from './helpers/EVMRevert';
require('./helpers/setup');

const Bridge = artifacts.require('Bridge');
const Vault = artifacts.require('Vault');
const PoaOperator = artifacts.require('PoaOperator');
const AdminableProxy = artifacts.require('AdminableProxy');

contract('PoaOperator', (accounts) => {
  const alice = accounts[0];
  const bob = accounts[1];
  const admin = accounts[3];

  describe('Test', () => {
    let bridge;
    let operator;
    let vault;
    let proxy;
    const parentBlockInterval = 0;
    const epochLength = 3;

    before(async () => {
      const bridgeCont = await Bridge.new();
      let data = await bridgeCont.contract.initialize.getData(parentBlockInterval);
      const proxyBridge = await AdminableProxy.new(bridgeCont.address, data,  {from: admin});
      bridge = Bridge.at(proxyBridge.address);

      const opCont = await PoaOperator.new();
      data = await opCont.contract.initialize.getData(bridge.address, epochLength);
      proxy = await AdminableProxy.new(opCont.address, data,  {from: admin});
      operator = PoaOperator.at(proxy.address);

      data = await bridge.contract.setOperator.getData(operator.address);
      await proxyBridge.applyProposal(data, {from: admin});
    });

    describe('Slot', () => {
      const p = [];
      before(async () => {
        p[0] = await bridge.tipHash();
      });
      describe('Auction', () => {
        it('should prevent submission by empty slot', async () => {
          await operator.submitPeriod(0, p[0], '0x01', {from: alice}).should.be.rejectedWith(EVMRevert);
        });

        it('should allow to set slot and submit block', async () => {
          let data = await operator.contract.setSlot.getData(0, alice, alice);
          await proxy.applyProposal(data, {from: admin});
          await operator.submitPeriod(0, p[0], '0x01', { from: alice }).should.be.fulfilled;
          p[1] = await bridge.tipHash();
        });
        it('should allow to set slot and submit block with reward', async () => {
          let data = await operator.contract.setSlot.getData(1, bob, bob);
          await proxy.applyProposal(data, {from: admin});
          await operator.submitPeriodForReward(1, p[1], '0x02', { from: bob }).should.be.fulfilled;
          p[2] = await bridge.tipHash();
        });
      });
    });
  });

});