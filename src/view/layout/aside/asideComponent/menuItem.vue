<template>
  <el-menu-item
    :index="fullPath"
    :style="{
      height: sideHeight
    }"
    @click="handleClick"
  >
    <el-icon v-if="routerInfo.meta && routerInfo.meta.icon">
      <component :is="routerInfo.meta.icon" />
    </el-icon>
    <template v-else>
      {{ isCollapse ? (routerInfo.meta && routerInfo.meta.title ? routerInfo.meta.title[0] : '') : "" }}
    </template>
    <template #title>
      {{ routerInfo.meta && routerInfo.meta.title ? routerInfo.meta.title : '' }}
    </template>
  </el-menu-item>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/pinia'
import { storeToRefs } from 'pinia'

// 获取应用配置
const appStore = useAppStore()
const { config } = storeToRefs(appStore)
const router = useRouter()

defineOptions({
  name: 'MenuItem'
})

const props = defineProps({
  routerInfo: {
    default: function () {
      return null
    },
    type: Object
  }
})

// 获取折叠状态
const isCollapse = inject('isCollapse', ref(false))

// 计算菜单项高度
const sideHeight = computed(() => {
  return config.value.layout_side_item_height + 'px'
})

// 计算完整路径用于菜单项索引
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
  console.log('菜单项完整路径:', path)
  return path
})

// 极度简化菜单项点击处理逻辑
const handleClick = () => {
  if (!props.routerInfo) return
  
  // 基于实际项目路由结构进行导航
  try {
    if (props.routerInfo.name) {
      // TG营销系统中，使用路由名称导航可能更可靠
      console.log('使用名称进行导航:', props.routerInfo.name)
      router.push({ name: props.routerInfo.name })
      return
    }
    
    // 如果没有名称，则使用路径导航
    if (props.routerInfo.path) {
      // 制作一个基于路由组件路径的完整URL地址
      
      // 首先确定基本路径
      let base = '/layout'
      
      // 追加父路径(如tg)
      if (props.routerInfo.parent && props.routerInfo.parent.path) {
        base = `${base}/${props.routerInfo.parent.path}`
      }
      
      // 完整路径 = 基本路径 + 当前路径
      const fullPath = `${base}/${props.routerInfo.path}`
      
      console.log('尝试直接路径导航:', fullPath)
      router.push(fullPath)
      return
    }
  } catch (error) {
    // 如果导航出错，则回到首页
    console.error('导航错误，默认跳转到首页:', error)
    router.push('/layout/tg/dashboard')
  }
}
</script>

<style lang="scss"></style>
