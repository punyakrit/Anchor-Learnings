'use client'

import { Keypair, PublicKey } from '@solana/web3.js'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram, useCounterProgramAccount } from './counter-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CounterCreate() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const { createEntry } = useCounterProgram()

  const { publicKey } = useWallet()

  const isFormValid = title.trim() !== '' && message.trim() !== ''

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey })
    }
  }

  if (!publicKey) {
    return <div>COnnect your walllet</div>
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-2"
      ></input>
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="input input-bordered w-full mb-2"
      ></textarea>
      <Button onClick={handleSubmit} disabled={!isFormValid || createEntry.isPending}>
        {createEntry.isPending ? 'Creating...' : 'Create Entry'}
      </Button>
      {createEntry.isError && (
        <div className="alert alert-error mt-2">
          <span>Error: {createEntry.error.message}</span>
        </div>
      )}
    </div>
  )
}

export function CounterList() {
  const { accounts, getProgramAccount } = useCounterProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CounterCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CounterCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCounterProgramAccount({
    account,
  })

  const { publicKey } = useWallet()

  const [message, setMessage] = useState('')
  const title = accountQuery.data?.title

  const isFormValid = message.trim() !== ''
  if (!title) {
    return <div>Error: Account does not have a title.</div>
  }
  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      updateEntry.mutateAsync({ title, message, owner: publicKey })
    }
  }

  if (!publicKey) {
    return <div>COnnect your walllet</div>
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card w-full bg-base-100 shadow-xl cursor-pointer" onClick={() => accountQuery.refetch()}>
      <div className="text-4xl ">{accountQuery.data?.title}</div>
      <div>{accountQuery.data?.message}</div>
      <div className="text-sm text-gray-500 flex justify-between">
        <textarea
          placeholder="Update message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input input-bordered w-full mb-2"
        ></textarea>
        <Button onClick={handleSubmit} disabled={!isFormValid || updateEntry.isPending}>
          {updateEntry.isPending ? 'Updating...' : 'Update Message'}
        </Button>
        <Button
          onClick={() => deleteEntry.mutate(accountQuery.data?.title || '')}
          disabled={deleteEntry.isPending}
          className="ml-2"
        >
          {deleteEntry.isPending ? 'Deleting...' : 'Delete Entry'}
          Delete Entry
        </Button>
      </div>
    </div>
  )
}
