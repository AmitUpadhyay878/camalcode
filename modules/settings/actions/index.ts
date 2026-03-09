'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { deleteWebHook } from '@/modules/github/lib/github'
import { count } from 'console'

export async function getUserProfile() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            throw new Error('Unauthorized')
        }
        const user = await prisma.user.findUnique({
            where: {
                id: session?.user?.id
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true
            }
        })
        return user
    } catch (error) {
        console.log("Error while fetching user detail: ", error)
        return null
    }
}

export async function updateUserProfile(data: { name?: string, email?: string }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        const updateUser = await prisma.user.update({
            where: {
                id: session?.user?.id
            },
            data: {
                name: data?.name,
                email: data?.email
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        })

        revalidatePath("/settings","page")
        return {
            success:true,
            user:updateUser
        }
    } catch (error) {
        console.log("Error while fetching user detail: ", error)
        return {success:false,error:"fail to update a user profile"}
    }
}

export async function getConnectedRepositories() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error('Unauthorized')
        }
        const repositories = await prisma.repository.findMany({
            where: {
                userId: session?.user?.id   
            },
            select: {
                id: true,
                name: true,
                fullName: true,
                url: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return repositories
    }
    catch (error) {
        console.log("Error while fetching connected repositories: ", error)
        return []
    }
}

export async function disconnectRepository(repoId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        const repository = await prisma.repository.findFirst({
            where: {
                id: repoId,
                userId: session?.user?.id
            }
        })

        if (!repository) {
            throw new Error("Repository not found")
        }

        await deleteWebHook(repository.owner, repository.name)

        await prisma.repository.delete({
            where: {
                id: repoId,
                userId: session?.user?.id
            }
        })
        revalidatePath("/settings","page")
        revalidatePath("/repository","page")
        return { success: true }
    }
    catch (error) {
        console.log("Error while disconnecting repository: ", error)
        return { success: false, error: "Failed to disconnect repository" }
    }
}

export async function disconnectAllRepositories() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error('Unauthorized')
        }

        
        const repositories = await prisma.repository.findMany({
            where: {
                userId: session?.user?.id
            }
        })

        if (!repositories || repositories.length === 0) {
            throw new Error("Repositories not found")
        }

       await Promise.all(repositories.map(async (repository) => {
            await deleteWebHook(repository.owner, repository.name)
        }))

       const result = await prisma.repository.deleteMany({
            where: {
                userId: session?.user?.id
            }
        })

        revalidatePath("/settings","page")
        revalidatePath("/repository","page")
        return { success: true, count: result.count }
    }
    catch (error) {
        console.log("Error while disconnecting all repositories: ", error)
        return { success: false, error: "Failed to disconnect all repositories" }
    }
} 