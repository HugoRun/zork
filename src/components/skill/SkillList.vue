<script setup lang="ts">
/**
 * 技能列表组件
 * 展示角色当前职业技能
 */
import { computed } from 'vue'
import { useSharedBattleEngine } from '@/composables/useSharedBattleEngine'
import { usePlayerStore } from '@/stores/playerStore'
import SkillCard from './SkillCard.vue'
import { CharacterClass } from '@/types'

const battleEngine = useSharedBattleEngine()
const playerStore = usePlayerStore()

/** 当前职业技能列表 */
const playerSkills = computed(() => {
  return battleEngine.skillSystem.availableSkills.value
})
</script>

<template>
  <div class="skill-list">
    <div v-if="playerSkills.length === 0" class="text-center text-muted py-4">
      暂无可用技能
    </div>
    <div v-else class="d-grid gap-2">
      <SkillCard
        v-for="skill in playerSkills"
        :key="skill.config.id"
        :skill="skill"
      />
    </div>
  </div>
</template>
