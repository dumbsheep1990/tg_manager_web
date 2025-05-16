<template>
  <component
    :is="menuComponent"
    v-if="!routerInfo.hidden"
    :router-info="routerInfo"
  >
    <template v-if="routerInfo.children && routerInfo.children.length">
      <AsideComponent
        v-for="item in routerInfo.children"
        :key="item.name"
        :router-info="item"
      />
    </template>
  </component>
</template>

<script setup>
  import MenuItem from './menuItem.vue'
  import AsyncSubmenu from './asyncSubmenu.vue'
  import { computed } from 'vue'

  defineOptions({
    name: 'AsideComponent'
  })

  const props = defineProps({
    routerInfo: {
      type: Object,
      default: () => null
    },
    mode: {
      type: String,
      default: 'vertical'
    }
  })

  const menuComponent = computed(() => {
    if (!props.routerInfo) return MenuItem
    
    // 对子路由添加parent引用，使子菜单能够获得完整路径
    if (props.routerInfo.children && props.routerInfo.children.length) {
      // 为每个子路由添加父路由引用
      props.routerInfo.children.forEach(child => {
        child.parent = props.routerInfo
        // 打印子菜单相关信息便于调试
        console.log('设置子菜单父引用:', child.name, child.path, props.routerInfo.path)
      })
      return AsyncSubmenu
    }
    
    return MenuItem
  })
</script>
