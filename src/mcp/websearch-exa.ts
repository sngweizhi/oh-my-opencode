export const websearch_exa = {
  type: "local" as const,
  command: ["npx", "-y", "exa-mcp-server"],
  environment: {}, // API key injected by createBuiltinMcps from oh-my-opencode.json
  enabled: true,
}
