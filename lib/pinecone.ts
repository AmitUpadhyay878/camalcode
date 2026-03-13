import {Pinecone} from '@pinecone-database/pinecone';

const pineconeApiKey = process.env.PINECONE_DB_API_KEY

if (!pineconeApiKey) {
  throw new Error('PINECONE_DB_API_KEY env var is not set')
}

export const pinecone = new Pinecone({
  apiKey: pineconeApiKey
})

export const pineconeIndex = pinecone.index('camalcode-vactor-embading-v2')