import {pineconeIndex} from '@/lib/pinecone'
import {embed} from 'ai'
import {google} from '@ai-sdk/google'

export async function generateEmbedding(text:string){
        const {embedding} = await embed({
            model:   google.embeddingModel('text-embedding-004'),
            value:text
        })

        return embedding
}

export async function indexCodebase(
    repoId:string,
    files:{path:string, content:string}[]
){
    const vectors = []
    for(const file of files){
        const content = `File: ${file.path}\n\nContent:\n${file.content}`
        const truncatedContent = content.slice(0, 8000) 
        try{
            const embedding = await generateEmbedding(truncatedContent)
            vectors.push({
                id: `${repoId}-${file.path.replace(/\//g, '_')}`,
                values: embedding,
                metadata:{
                    repoId,
                    filePath: file.path,
                    content: truncatedContent,
                }
            })

        }catch(error){
            console.error(`Error generating embedding for file ${file.path}:`, error)
        }
    }

    if(vectors.length > 0){
        const batchSize = 100

        for(let i=0; i< vectors.length; i+= batchSize){
            const batch = vectors.slice(i, i+batchSize)
             await pineconeIndex.upsert({records: batch})
            
    }
        }

        console.log(`Indexed ${vectors.length} files for repo ${repoId} is completed.`)

}

export async function retriveContext(query:string, repoId:string, topK:number=5){
    const embedding = await generateEmbedding(query)

    const result = await pineconeIndex.query({
        vector: embedding,
        topK,
        filter:{
            repoId
        },
        includeMetadata:true
    })

    return result.matches.map(match=>match.metadata?.content as string).filter(Boolean)
}


// import { pineconeIndex } from '@/lib/pinecone'
// import { embed } from 'ai'
// import { google } from '@ai-sdk/google'
// import { PineconeRecord } from '@pinecone-database/pinecone'

// type Metadata = {
//   repoId: string
//   filePath: string
//   content: string
// }

// export async function generateEmbedding(text: string): Promise<number[]> {
//   const { embedding } = await embed({
//     model: google.embeddingModel('text-embedding-004'),
//     value: text,
//   })

//   return embedding
// }

// export async function indexCodebase(
//   repoId: string,
//   files: { path: string; content: string }[]
// ) {
//   try {
//     const vectors: PineconeRecord<Metadata>[] = []

//     await Promise.all(
//       files.map(async (file) => {
//         const content = `File: ${file.path}\n\nContent:\n${file.content}`

//         // limit size to control embedding cost
//         const truncatedContent = content.slice(0, 8000)

//         try {
//           const embedding = await generateEmbedding(truncatedContent)

//           vectors.push({
//             id: `${repoId}-${file.path.replace(/\//g, '_')}`,
//             values: embedding,
//             metadata: {
//               repoId,
//               filePath: file.path,
//               content: truncatedContent,
//             },
//           })
//         } catch (error) {
//           console.error(
//             `Error generating embedding for file ${file.path}:`,
//             error
//           )
//         }
//       })
//     )

//     if (vectors.length === 0) {
//       console.log(`No vectors generated for repo ${repoId}`)
//       return
//     }

//     const batchSize = 100

//     for (let i = 0; i < vectors.length; i += batchSize) {
//       const batch = vectors.slice(i, i + batchSize)

//       await pineconeIndex.upsert({
//         records: batch,
//       })
//     }

//     console.log(`Indexed ${vectors.length} files for repo ${repoId}`)
//   } catch (error) {
//     console.error('Indexing failed:', error)
//   }
// }

// export async function retriveContext(query:string, repoId:string, topK:number=5){
//     const embedding = await generateEmbedding(query)

//     const result = await pineconeIndex.query({
//         vector: embedding,
//         topK,
//         filter:{
//             repoId
//         },
//         includeMetadata:true
//     })

//     return result.matches.map(match=>match.metadata?.content as string).filter(Boolean)
// }
