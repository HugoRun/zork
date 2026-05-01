/**
 * 地图区域配置
 */
import type { Area, WorldMap } from '@/types'

/** 小地图配置 */
const smallMaps = {
  // 新手村
  village_1: {
    id: 'village_1',
    name: '村口小径',
    areaId: 'village',
    level: 1,
    levelRange: [1, 3] as [number, number],
    unlockLevel: 1,
    monsterIds: ['slime', 'rat'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  village_2: {
    id: 'village_2',
    name: '农场外围',
    areaId: 'village',
    level: 3,
    levelRange: [3, 5] as [number, number],
    unlockLevel: 3,
    unlockMapId: 'village_1',
    monsterIds: ['wolf', 'boar'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  village_3: {
    id: 'village_3',
    name: '村庄废墟',
    areaId: 'village',
    level: 5,
    levelRange: [5, 7] as [number, number],
    unlockLevel: 5,
    unlockMapId: 'village_2',
    monsterIds: ['skeleton', 'zombie'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  
  // 暗影森林
  forest_1: {
    id: 'forest_1',
    name: '森林入口',
    areaId: 'forest',
    level: 6,
    levelRange: [6, 9] as [number, number],
    unlockLevel: 6,
    monsterIds: ['goblin', 'spider'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  forest_2: {
    id: 'forest_2',
    name: '迷雾深处',
    areaId: 'forest',
    level: 10,
    levelRange: [10, 13] as [number, number],
    unlockLevel: 10,
    unlockMapId: 'forest_1',
    monsterIds: ['treant', 'wisp'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  forest_3: {
    id: 'forest_3',
    name: '暗影祭坛',
    areaId: 'forest',
    level: 14,
    levelRange: [14, 16] as [number, number],
    unlockLevel: 14,
    unlockMapId: 'forest_2',
    monsterIds: ['darkelf', 'shadow'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  
  // 熔岩峡谷
  canyon_1: {
    id: 'canyon_1',
    name: '灼热入口',
    areaId: 'canyon',
    level: 16,
    levelRange: [16, 19] as [number, number],
    unlockLevel: 16,
    monsterIds: ['fireimp', 'lavagoyle'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  canyon_2: {
    id: 'canyon_2',
    name: '岩浆河畔',
    areaId: 'canyon',
    level: 20,
    levelRange: [20, 23] as [number, number],
    unlockLevel: 20,
    unlockMapId: 'canyon_1',
    monsterIds: ['fireelemental', 'phoenix'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  canyon_3: {
    id: 'canyon_3',
    name: '烈焰深渊',
    areaId: 'canyon',
    level: 24,
    levelRange: [24, 26] as [number, number],
    unlockLevel: 24,
    unlockMapId: 'canyon_2',
    monsterIds: ['demon', 'hellhound'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  
  // 冰霜要塞
  fortress_1: {
    id: 'fortress_1',
    name: '寒冰走廊',
    areaId: 'fortress',
    level: 26,
    levelRange: [26, 29] as [number, number],
    unlockLevel: 26,
    monsterIds: ['icewolf', 'frostgiant'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  fortress_2: {
    id: 'fortress_2',
    name: '冰封大厅',
    areaId: 'fortress',
    level: 30,
    levelRange: [30, 33] as [number, number],
    unlockLevel: 30,
    unlockMapId: 'fortress_1',
    monsterIds: ['wraith', 'icewyrm'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  fortress_3: {
    id: 'fortress_3',
    name: '霜之哀伤',
    areaId: 'fortress',
    level: 34,
    levelRange: [34, 36] as [number, number],
    unlockLevel: 34,
    unlockMapId: 'fortress_2',
    monsterIds: ['frostlich', 'icetitan'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  
  // 魔龙巢穴
  dragon_1: {
    id: 'dragon_1',
    name: '巢穴入口',
    areaId: 'dragon',
    level: 36,
    levelRange: [36, 39] as [number, number],
    unlockLevel: 36,
    monsterIds: ['drake', 'wyvern'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  dragon_2: {
    id: 'dragon_2',
    name: '龙骨荒野',
    areaId: 'dragon',
    level: 40,
    levelRange: [40, 43] as [number, number],
    unlockLevel: 40,
    unlockMapId: 'dragon_1',
    monsterIds: ['dragonegg', 'elderdake'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  dragon_3: {
    id: 'dragon_3',
    name: '魔龙之殿',
    areaId: 'dragon',
    level: 44,
    levelRange: [44, 50] as [number, number],
    unlockLevel: 44,
    unlockMapId: 'dragon_2',
    monsterIds: ['dragon', 'dragonlord'],
    maxMonsters: 8,
    spawnInterval: 5000
  },

  // 深渊领域
  abyss_1: {
    id: 'abyss_1',
    name: '深渊入口',
    areaId: 'abyss',
    level: 45,
    levelRange: [45, 48] as [number, number],
    unlockLevel: 45,
    unlockMapId: 'dragon_3',
    monsterIds: ['shadow_wraith', 'void_stalker'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  abyss_2: {
    id: 'abyss_2',
    name: '虚空深渊',
    areaId: 'abyss',
    level: 50,
    levelRange: [50, 55] as [number, number],
    unlockLevel: 50,
    unlockMapId: 'abyss_1',
    monsterIds: ['abyssal_golem', 'shadow_hunter', 'void_stalker'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  abyss_3: {
    id: 'abyss_3',
    name: '深渊王座',
    areaId: 'abyss',
    level: 55,
    levelRange: [55, 60] as [number, number],
    unlockLevel: 55,
    unlockMapId: 'abyss_2',
    monsterIds: ['void_titan', 'abyss_lord', 'shadow_hunter'],
    maxMonsters: 8,
    spawnInterval: 5000
  },

  // 神界圣域
  heaven_1: {
    id: 'heaven_1',
    name: '天界之门',
    areaId: 'heaven',
    level: 55,
    levelRange: [55, 58] as [number, number],
    unlockLevel: 55,
    unlockMapId: 'abyss_3',
    monsterIds: ['holy_knight', 'seraph'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  heaven_2: {
    id: 'heaven_2',
    name: '星辰圣殿',
    areaId: 'heaven',
    level: 60,
    levelRange: [60, 65] as [number, number],
    unlockLevel: 60,
    unlockMapId: 'heaven_1',
    monsterIds: ['star_guardian', 'archangel', 'seraph'],
    maxMonsters: 8,
    spawnInterval: 5000
  },
  heaven_3: {
    id: 'heaven_3',
    name: '神之殿堂',
    areaId: 'heaven',
    level: 65,
    levelRange: [65, 70] as [number, number],
    unlockLevel: 65,
    unlockMapId: 'heaven_2',
    monsterIds: ['divine_beast', 'god_emperor', 'archangel'],
    maxMonsters: 8,
    spawnInterval: 5000
  }
}

/** 区域配置 */
const areas: Area[] = [
  {
    id: 'village',
    name: '新手村',
    description: '平静的村庄，适合新冒险者开始旅程',
    levelRange: [1, 7],
    maps: [smallMaps.village_1, smallMaps.village_2, smallMaps.village_3]
  },
  {
    id: 'forest',
    name: '暗影森林',
    description: '神秘的森林，充满危险的生物',
    levelRange: [6, 16],
    maps: [smallMaps.forest_1, smallMaps.forest_2, smallMaps.forest_3]
  },
  {
    id: 'canyon',
    name: '熔岩峡谷',
    description: '灼热的峡谷，火焰生物的领地',
    levelRange: [16, 26],
    maps: [smallMaps.canyon_1, smallMaps.canyon_2, smallMaps.canyon_3]
  },
  {
    id: 'fortress',
    name: '冰霜要塞',
    description: '被永恒寒冰覆盖的古老要塞',
    levelRange: [26, 36],
    maps: [smallMaps.fortress_1, smallMaps.fortress_2, smallMaps.fortress_3]
  },
  {
    id: 'dragon',
    name: '魔龙巢穴',
    description: '传说中的魔龙栖息地，最危险的区域',
    levelRange: [36, 50],
    maps: [smallMaps.dragon_1, smallMaps.dragon_2, smallMaps.dragon_3]
  },
  {
    id: 'abyss',
    name: '深渊领域',
    description: '暗影与虚空交织的禁忌之地',
    levelRange: [45, 60],
    maps: [smallMaps.abyss_1, smallMaps.abyss_2, smallMaps.abyss_3]
  },
  {
    id: 'heaven',
    name: '神界圣域',
    description: '众神居住的圣地，最高级别的试炼场',
    levelRange: [55, 70],
    maps: [smallMaps.heaven_1, smallMaps.heaven_2, smallMaps.heaven_3]
  }
]

/** 世界地图配置 */
export const worldMap: WorldMap = {
  areas
}

/** 获取小地图配置 */
export function getSmallMap(mapId: string) {
  return Object.values(smallMaps).find(m => m.id === mapId)
}

/** 获取区域配置 */
export function getArea(areaId: string) {
  return areas.find(a => a.id === areaId)
}

/** 获取区域的所有小地图 */
export function getAreaMaps(areaId: string) {
  const area = getArea(areaId)
  return area ? area.maps : []
}
