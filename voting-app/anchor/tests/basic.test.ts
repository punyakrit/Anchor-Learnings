import * as anchor from '@coral-xyz/anchor'
import { before, describe, it } from 'node:test'
import { Voteing } from '../target/types/voteing'
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { strict as assert } from 'node:assert';


const IDL = require('../target/idl/voteing.json')

const votingAddress = new PublicKey("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H")

describe('voteing', () => {
  let context;

  let provider;

  let voteingProgram:any;

  before(async () => {
    context = await startAnchor("", [{ name: "Voteing", programId: votingAddress }], []);

    provider = new BankrunProvider(context);

    voteingProgram = new Program<Voteing>(
      IDL,
      provider,
    );
  })


  it('initialise poll', async () => {


    await voteingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is this Description",
      new anchor.BN(0),
      new anchor.BN(8978378278998)
    ).rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    )

    const poll = await voteingProgram.account.poll.fetch(pollAddress);
    console.log(poll)

    assert.equal(poll.pollId.toNumber(), 1);

  })

   it('initialise poll', async () => {


    await voteingProgram.methods.initialiseCandidate(
      "Smooth",
      new anchor.BN(1)
    ).rpc()

    await voteingProgram.methods.initialiseCandidate(
      "3wjm",
      new anchor.BN(2)
    ).rpc()

    

    // assert.equal(poll.pollId.toNumber(), 1);

  })
})
