/**
 * 格式化工具函数
 */

/**
 * 格式化数字（千分位）
 * @param num 数字
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

/**
 * 格式化大数字（使用K/M/B后缀）
 * @param num 数字
 */
export function formatBigNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * 格式化百分比
 * @param value 值 (0-1)
 */
export function formatPercent(value: number): string {
  return Math.floor(value * 100) + '%'
}

/**
 * 格式化伤害数字
 * @param damage 伤害值
 */
export function formatDamage(damage: number): string {
  if (damage >= 10000) {
    return formatBigNumber(damage)
  }
  return formatNumber(Math.floor(damage))
}

/**
 * 格式化时间（秒 -> MM:SS）
 * @param seconds 秒数
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化持续时间（毫秒 -> X分X秒）
 * @param ms 毫秒数
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分`
  }
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`
  }
  return `${seconds}秒`
}

/**
 * 格式化日期时间
 * @param timestamp 时间戳
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 格式化属性值（根据类型选择显示方式）
 * 所有属性均显示为整数
 * @param value 属性值
 * @param isPercent 是否为百分比
 */
export function formatStat(value: number, isPercent: boolean = false): string {
  if (isPercent) {
    return Math.floor(value * 100) + '%'
  }
  return formatNumber(Math.floor(value))
}

/**
 * 格式化属性值（智能显示）
 * 百分比属性显示为整数百分比（如 5%），整数属性不显示小数
 * @param value 属性值
 * @param isPercent 是否为百分比
 */
export function formatStatValue(value: number, isPercent: boolean = false): string {
  if (isPercent) {
    return Math.floor(value * 100) + '%'
  }
  return Math.floor(value).toString()
}

/**
 * 截断文本
 * @param text 文本
 * @param maxLength 最大长度
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
