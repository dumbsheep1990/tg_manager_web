<template>
  <div>
    <normal-mode
      v-if="
        config.side_mode === 'normal' ||
        (device === 'mobile' && config.side_mode == 'head') ||
        (device === 'mobile' && config.side_mode == 'combination') ||
        (device === 'mobile' && config.side_mode == 'sidebar')
      "
    />
    <head-mode v-if="config.side_mode === 'head' && device !== 'mobile'" />
    <combination-mode
      v-if="config.side_mode === 'combination' && device !== 'mobile'"
      :mode="mode"
    />
    <sidebar-mode
      v-if="config.side_mode === 'sidebar' && device !== 'mobile'"
    />
  </div>
</template>

<script setup>
  import NormalMode from './normalMode.vue'
  import HeadMode from './headMode.vue'
  import CombinationMode from './combinationMode.vue'
  import SidebarMode from './sidebarMode.vue'

  import { ref, provide } from 'vue'

  const isCollapse = ref(false)
  isCollapse.value = false

  provide('isCollapse', ref(false))
  provide('isSider', true)

  const alwaysExpanded = () => {
    console.log('菜单展开状态被要求切换，但已被强制始终展开')
    isCollapse.value = false
  }
  provide('toggleCollapse', alwaysExpanded)

  defineProps({
    mode: {
      type: String,
      default: 'normal'
    }
  })

  import { storeToRefs } from 'pinia'
  import { useAppStore } from '@/pinia'
  const appStore = useAppStore()
  const { config, device } = storeToRefs(appStore)
</script>
