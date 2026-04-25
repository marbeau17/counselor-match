import { execSync } from 'node:child_process'

/**
 * ローカル Supabase に対する DB 直接クエリ helper。
 * `docker exec supabase_db_counselor-match psql -U postgres -At -c <SQL>` を実行。
 * テストの "DB に値が反映されているか" を検証する用途。
 */
export function dbQuery(sql: string): string {
  try {
    const result = execSync(
      `docker exec supabase_db_counselor-match psql -U postgres -At -c ${JSON.stringify(sql)}`,
      { encoding: 'utf-8', timeout: 10000 }
    )
    return result.trim()
  } catch (err) {
    throw new Error(`DB query failed: ${(err as Error).message}`)
  }
}

/** 与えた SQL の COUNT(*) を返す */
export function dbCount(sql: string): number {
  const result = dbQuery(sql)
  return parseInt(result, 10) || 0
}
