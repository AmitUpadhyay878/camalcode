import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { indexCodebase } from "@/modules/ai/lib/rag";
import { getRepoFilesContent } from "@/modules/github/lib/github";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    if (!owner || !repo || !userId) {
      throw new Error("Missing required fields: owner, repo, or userId")
    }

    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          providerId: "github"
        }
      })

      if (!account?.accessToken) {
        throw new Error("GitHub account not found for user")
      }

      return await getRepoFilesContent(owner, repo, account?.accessToken)
    })

    await step.run("index-codebase", async () => {
      await indexCodebase(`${owner}/${repo}`, files)
    })

    return { success: true, indexedFiles: files.length }
  }
)


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);