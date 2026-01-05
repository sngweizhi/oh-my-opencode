export const websearch_exa = {
  type: "local" as const,
  command: ["npx", "-y", "exa-mcp-server", "--tools=web_search_exa"],
  environment: {}, // API key injected by createBuiltinMcps from oh-my-opencode.json
  enabled: true,
}
