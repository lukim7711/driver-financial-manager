import type { ApiResponse } from '../types'

export type Bindings = {
  DB: DurableObjectNamespace
  ENVIRONMENT?: string
  OCR_SPACE_API_KEY?: string
}

export function getDB(env: Bindings): DurableObjectStub {
  const id = env.DB.idFromName('default')
  return env.DB.get(id)
}

export async function queryDB(
  db: DurableObjectStub,
  sql: string,
  params: unknown[] = []
): Promise<Record<string, unknown>[]> {
  const res = await db.fetch(
    new Request('http://do/query', {
      method: 'POST',
      body: JSON.stringify({ query: sql, params }),
    })
  )
  const result = (await res.json()) as ApiResponse<
    Record<string, unknown>[]
  >
  return result.data || []
}
