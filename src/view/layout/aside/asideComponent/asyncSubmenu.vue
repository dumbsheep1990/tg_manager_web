<template>
  <el-sub-menu
    class="gva-sub-menu"
    :index="routerInfo.name || routerInfo.path || ''"
    :key="routerInfo.name"
    v-if="routerInfo.children && routerInfo.children.length > 0"
    :popper-class="'el-menu--' + (isHover ? 'vertical' : mode)"
    :teleported="true"
    v-bind:open="true"
  >
    <template #title>
      <div
        v-if="!isCollapse"
        class="flex items-center"
        :style="{
          height: sideHeight
        }"
      >
        <el-icon v-if="routerInfo.meta.icon">
          <component :is="routerInfo.meta.icon" />
        </el-icon>
        <span>{{ routerInfo.meta.title }}</span>
      </div>
      <template v-else>
        <el-icon v-if="routerInfo.meta.icon">
          <component :is="routerInfo.meta.icon" />
        </el-icon>
        <span>{{ routerInfo.meta.title }}</span>
      </template>
    </template>
    <slot />
  </el-sub-menu>
</template>

<script setup>
  import { inject, computed, ref } from 'vue'
  import { useAppStore } from '@/pinia'
  import { storeToRefs } from 'pinia'
  const appStore = useAppStore()
  const { config } = storeToRefs(appStore)

  defineOptions({
    name: 'AsyncSubmenu'
  })

  const props = defineProps({
    routerInfo: {
      default: function () {
        return null
      },
      type: Object
    }
  })

  const isCollapse = inject('isCollapse', ref(false))
  
  // 添加mode模式判断
  const mode = inject('mode', 'vertical')
  // 添加hover状态判断
  const isHover = inject('isHover', ref(false))

  const sideHeight = computed(() => {
    return config.value.layout_side_item_height + 'px'
  })
  
  // 计算完整路径作为菜单项的索引
  const fullPath = computed(() => {
    if (!props.routerInfo) return ''
    
    const paths = ['/layout']
    
    // 如果有父路径则添加
    if (props.routerInfo.parent && props.routerInfo.parent.path) {
      paths.push(props.routerInfo.parent.path)
    }
    
    // 添加当前路径
    if (props.routerInfo.path) {
      paths.push(props.routerInfo.path)
    }
    
    const path = paths.join('/').replace(/\/\/+/g, '/')
    console.log('子菜单完整路径:', path)
    return path
  })
</script>

<style lang="scss">
  .gva-sub-menu {
    .el-sub-menu__title {
      height: v-bind('sideHeight') !important;
      font-weight: 500;
      
      &:hover {
        background-color: rgba(64, 158, 255, 0.1) !important;
      }
    }
    
    &:hover {
      .el-sub-menu__icon-arrow {
        color: #409EFF;
      }
    }
    
    &.is-active {
      > .el-sub-menu__title {
        color: #409EFF !important;
      }
    }
  }
  
  .el-menu--vertical {
    .el-menu-item {
      &.is-active {
        background-color: rgba(64, 158, 255, 0.1) !important;
      }
    }
  }
</style>
