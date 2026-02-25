'use client'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {connectRepository} from '../actions'
import {toast} from 'sonner'

export const useConnectRepository =()=>{
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:async({owner, repo, githubId}:{owner:string, repo:string,githubId:number})=>{
            return await connectRepository(owner, repo, githubId)
        },
        onSuccess: (data, variables) => {
      toast.success("Repository Connected Successfully")
      
      queryClient.setQueryData(["repositories"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) =>
            page.map((repo: any) =>
              Number(repo.id) === Number(variables.githubId) 
                ? { ...repo, isConnected: true } 
                : repo
            )
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["repositories"] })
    },
        onError:(error)=>{
            toast.error("Fail to Connect a Repository ")
            console.log(error)
        }
    })
}
