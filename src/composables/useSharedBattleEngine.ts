/**
 * 共享战斗引擎实例
 * 确保整个应用只创建一个战斗引擎实例
 */
import { useBattleEngine } from './battle/useBattleEngine'

// 单例：全局只创建一次
let battleEngineInstance: ReturnType<typeof useBattleEngine> | null = null

/**
 * 获取共享的战斗引擎实例
 */
export function useSharedBattleEngine() {
  if (!battleEngineInstance) {
    battleEngineInstance = useBattleEngine()
  }
  return battleEngineInstance
}
