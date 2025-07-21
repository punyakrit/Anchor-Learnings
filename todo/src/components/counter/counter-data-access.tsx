'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

interface TodosArgs{
  title: string
  description: string
  done: boolean
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
    queryFn: () => program.account.todo.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initializeTodo = useMutation<string, Error,TodosArgs>(
    {
      mutationKey:['todo', 'initialize', { cluster }],
      mutationFn: async({title, description, done })=>{
          return program.methods.addTodo(title, description).rpc()
      },
      onSuccess:(signature) =>{
        transactionToast(signature)
        toast.success('Todo created successfully!')
      },
      onError:(error) =>{
        toast.error('Failed to create todo.' + error.message)
      }
    }
  )

  

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initializeTodo,
  }
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCounterProgram()

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.todo.fetch(account),
  })

  const updateTodo = useMutation<string, Error, TodosArgs>({
      mutationKey: ['todo', 'update', { cluster }],
      mutationFn: async ({ title, description, done }) => {
        return program.methods.updateTodo(title, description, done).rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      toast.success('Todo updated successfully!')
    } ,
    onError: (error) => {
      toast.error('Failed to update todo.' + error.message)
  }}
)

const deleteTodod = useMutation<string, Error>({
  mutationKey: ['todo', 'delete', { cluster }],
  mutationFn: async () => {
    return program.methods.deleteTodo(title).rpc()
  },
  onSuccess: (signature) => {
    transactionToast(signature)
    toast.success('Todo deleted successfully!')
  },
  onError: (error) => {
    toast.error('Failed to delete todo.' + error.message)
  }
})


  return {
    accountQuery,
    updateTodo,
  }
}
