import { Badge } from "@/components/ui/badge"

 export const renderLanguageBadge = (language: string | null) => {
  const lang = (language || "unknown").toLowerCase()

  switch (lang) {
    case "javascript":
      return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">JavaScript</Badge>

    case "typescript":
      return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">TypeScript</Badge>

    case "python":
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Python</Badge>

    case "java":
      return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">Java</Badge>

    case "go":
      return <Badge className="bg-cyan-500/20 text-cyan-600 border-cyan-500/30">Go</Badge>

    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}