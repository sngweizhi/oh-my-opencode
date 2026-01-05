import { websearch_exa } from "./websearch-exa"
import { context7 } from "./context7"
import { grep_app } from "./grep-app"
import { deepwiki } from "./deepwiki"
import type { McpName } from "./types"

export { McpNameSchema, type McpName } from "./types"

type RemoteMcp = { type: "remote"; url: string; enabled: boolean }
type LocalMcp = { type: "local"; command: string[]; environment?: Record<string, string>; enabled: boolean }
type McpConfig = RemoteMcp | LocalMcp

export interface McpApiKeys {
  exa_api_key?: string
}

const allBuiltinMcps: Record<McpName, McpConfig> = {
  websearch_exa,
  context7,
  grep_app,
  deepwiki,
}

export function createBuiltinMcps(disabledMcps: McpName[] = [], apiKeys: McpApiKeys = {}) {
  const mcps: Record<string, McpConfig> = {}

  for (const [name, config] of Object.entries(allBuiltinMcps)) {
    if (!disabledMcps.includes(name as McpName)) {
      // Inject API keys for local MCPs that need them
      if (name === "websearch_exa" && config.type === "local" && apiKeys.exa_api_key) {
        mcps[name] = {
          ...config,
          environment: {
            ...config.environment,
            EXA_API_KEY: apiKeys.exa_api_key,
          },
        }
      } else {
        mcps[name] = config
      }
    }
  }

  return mcps
}
