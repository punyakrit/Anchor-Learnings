'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { mutationOptions, useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

interface CreateEntryArgs{
  title: string,
  message:string,
  owner: PublicKey
}

export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCounterProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.journalEntry.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey:['journalEntry', 'create',{cluster}],
    mutationFn:async ({title, message, owner})=>{
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess : (signature)=>{
      transactionToast(signature)
      accounts.refetch()
    },
    onError:(error)=>{
      toast.error(error.message)
    }
  }, 
)
return{
  program,
  accounts,
  getProgramAccount,
  createEntry
}
  
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCounterProgram()

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntry.fetch(account),
  })

  const updateEntry = useMutation<string, Error, CreateEntryArgs>(
    {
      mutationKey:['journalEntry','update', {cluster}],
      mutationFn: async({title,message})=>{
        return program.methods.updateJournal(title,message).rpc()
      },
      onSuccess : (signature) =>{
        transactionToast(signature)
        accounts.refetch()
      },
      onError:(error)=>{
        toast.error(error.message)
      }
    }
  )


  const deleteEntry = useMutation(
    {
      mutationKey:['journalEntry','delete',{cluster}],
      mutationFn : (title: string)=>{
          return program.methods.deleteJournal(title).rpc();
      },
      onSuccess: (signature)=>{
        transactionToast(signature)
        accounts.refetch()
      },
       onError:(error)=>{
        toast.error(error.message)
      }
    }
  )

  return {
    accountQuery,
    updateEntry,
    deleteEntry
  }
}
