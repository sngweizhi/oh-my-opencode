import { execSync } from "child_process"
import { log } from "../../shared/logger"

export interface UpstreamStatus {
  hasUpdates: boolean
  behindCount: number
  localBranch: string
  upstreamBranch: string
}

const UPSTREAM_REMOTE = "upstream"
const UPSTREAM_BRANCH = "dev"
const FETCH_TIMEOUT_MS = 10000

/**
 * Check if the local repository is behind the upstream remote.
 * Returns null if check fails (no upstream remote, not a git repo, etc.)
 */
export function checkUpstreamStatus(repoDir: string): UpstreamStatus | null {
  try {
    // Verify upstream remote exists
    const remotes = execSync("git remote", {
      cwd: repoDir,
      encoding: "utf-8",
      timeout: 5000,
    }).trim().split("\n")

    if (!remotes.includes(UPSTREAM_REMOTE)) {
      log("[git-checker] No upstream remote configured")
      return null
    }

    // Fetch upstream (silent, with timeout)
    execSync(`git fetch ${UPSTREAM_REMOTE} --quiet`, {
      cwd: repoDir,
      timeout: FETCH_TIMEOUT_MS,
      stdio: ["pipe", "pipe", "pipe"],
    })

    // Get current branch
    const localBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: repoDir,
      encoding: "utf-8",
      timeout: 5000,
    }).trim()

    // Check if upstream branch exists
    const upstreamRef = `${UPSTREAM_REMOTE}/${UPSTREAM_BRANCH}`
    try {
      execSync(`git rev-parse --verify ${upstreamRef}`, {
        cwd: repoDir,
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
      })
    } catch {
      log(`[git-checker] Upstream branch ${upstreamRef} not found`)
      return null
    }

    // Count commits behind upstream
    const behindCount = parseInt(
      execSync(`git rev-list --count HEAD..${upstreamRef}`, {
        cwd: repoDir,
        encoding: "utf-8",
        timeout: 5000,
      }).trim(),
      10
    )

    log(`[git-checker] Upstream status: ${behindCount} commits behind ${upstreamRef}`)

    return {
      hasUpdates: behindCount > 0,
      behindCount,
      localBranch,
      upstreamBranch: upstreamRef,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    log(`[git-checker] Failed to check upstream status: ${message}`)
    return null
  }
}
