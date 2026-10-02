import { DexieRepository } from './dexieRepository'
import type { Repository } from './repository'

// クラウド同期に切り替えるときは、ここだけ差し替えます
export const repository: Repository = new DexieRepository()
