/**
 * 随机数工具函数
 */

/**
 * 生成指定范围内的随机整数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成指定范围内的随机浮点数
 * @param min 最小值（包含）
 * @param max 最大值（不包含）
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * 根据概率判断是否命中
 * @param probability 概率 (0-1)
 */
export function rollChance(probability: number): boolean {
  return Math.random() < probability
}

/**
 * 从数组中随机选择一个元素
 * @param array 数组
 */
export function randomChoice<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[randomInt(0, array.length - 1)]
}

/**
 * 带权重的随机选择
 * @param items 物品数组
 * @param weights 权重数组（与items一一对应）
 */
export function weightedChoice<T>(items: T[], weights: number[]): T | undefined {
  if (items.length === 0 || items.length !== weights.length) return undefined
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return items[i]
    }
  }
  
  return items[items.length - 1]
}

/**
 * 打乱数组顺序（Fisher-Yates算法）
 * @param array 数组
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成随机名称后缀
 */
export function randomSuffix(): string {
  return Math.random().toString(36).substr(2, 4).toUpperCase()
}
