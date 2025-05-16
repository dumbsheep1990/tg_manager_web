<template>
  <div
    class="relative h-full bg-white text-slate-700 dark:text-slate-300 dark:bg-slate-900 border-r shadow dark:shadow-gray-700"
    :class="isCollapse ? '' : '  px-2'"
    :style="{
      width: layoutSideWidth + 'px'
    }"
  >
    <el-scrollbar>
      <el-menu
        :collapse="false"
        :collapse-transition="false"
        :default-active="active"
        class="border-r-0 w-full"
        :default-openeds="defaultOpeneds"
        :unique-opened="false"
        @open="handleOpen"
        @select="selectMenuItem"
      >
        <template v-for="item in routerStore.asyncRouters[0]?.children || []">
          <aside-component
            v-if="!item.hidden"
            :key="item.name"
            :router-info="item"
          />
        </template>
      </el-menu>
    </el-scrollbar>
    <div
      class="absolute bottom-8 right-2 w-8 h-8 bg-gray-50 dark:bg-slate-800 flex items-center justify-center rounded cursor-pointer"
      :class="isCollapse ? 'right-0 left-0 mx-auto' : 'right-2'"
      @click="toggleCollapse"
    >
      <el-icon v-if="!isCollapse">
        <DArrowLeft />
      </el-icon>
      <el-icon v-else>
        <DArrowRight />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
  import AsideComponent from '@/view/layout/aside/asideComponent/index.vue'
  import { ref, provide, watchEffect, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useRouterStore } from '@/pinia/modules/router'
  import { useAppStore } from '@/pinia'
  import { storeToRefs } from 'pinia'
  const appStore = useAppStore()
  const { device, config } = storeToRefs(appStore)

  defineOptions({
    name: 'GvaAside'
  })
  const route = useRoute()
  const router = useRouter()
  const routerStore = useRouterStore()
  // 强制菜单始终保持展开状态
  const isCollapse = ref(false)
  
  // 禁用折叠功能
  const toggleCollapse = () => {
    // 强制设置为false，确保始终展开
    isCollapse.value = false
  }
  const active = ref('')
  // 创建默认展开的菜单数组
  // 默认展开所有菜单
  const defaultOpeneds = ref(['TG', 'tgTelegram', 'tgTask', 'tgGroup', 'tgUser', 'tgSystemSettings'])
  
  // 初始化时确保菜单展开
  onMounted(() => {
    // 强制菜单始终展开
    isCollapse.value = false
    
    // 遍历菜单列表，将所有父菜单项添加到默认展开数组中
    if (routerStore.asyncRouters[0]?.children) {
      const menuItems = routerStore.asyncRouters[0].children
      collectMenus(menuItems)
    }
  })
  
  // 收集所有菜单项，包括嵌套的子菜单
  const collectMenus = (menus) => {
    menus.forEach(menu => {
      if (menu.name) {
        // 将菜单名称添加到默认展开数组
        if (!defaultOpeneds.value.includes(menu.name)) {
          defaultOpeneds.value.push(menu.name)
        }
      }
      
      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        collectMenus(menu.children)
      }
    })
  }
  
  // 处理菜单打开事件
  const handleOpen = (key, keyPath) => {
    console.log('菜单打开:', key, keyPath)
  }
  const layoutSideWidth = computed(() => {
    if (!isCollapse.value) {
      return config.value.layout_side_width
    } else {
      return config.value.layout_side_collapsed_width
    }
  })
  watchEffect(() => {
    if (route.name === 'Iframe') {
      active.value = decodeURIComponent(route.query.url)
      return
    }
    active.value = route.meta.activeName || route.name
    
    // 初始化默认展开的菜单数组，确保所有菜单始终展开
    defaultOpeneds.value = []
    
    // 获取所有可能的父菜单路径
    if (routerStore.asyncRouters && routerStore.asyncRouters.length > 0) {
      routerStore.asyncRouters.forEach(router => {
        if (router.children) {
          router.children.forEach(item => {
            // 将所有菜单项添加到默认展开列表中
            defaultOpeneds.value.push(item.path)
            if (item.path) {
              defaultOpeneds.value.push('/layout/' + item.path)
              defaultOpeneds.value.push(item.path)
            }
            if (item.children) {
              item.children.forEach(child => {
                if (child.path) {
                  // 添加完整路径确保子菜单也能展开
                  if (item.path) {
                    // 安全地添加全路径
                    defaultOpeneds.value.push('/layout/' + item.path + '/' + child.path)
                    defaultOpeneds.value.push(item.path + '/' + child.path)
                  } else {
                    // 如果没有父路径，直接使用子路径
                    defaultOpeneds.value.push('/layout/' + child.path)
                    defaultOpeneds.value.push(child.path)
                  }
                }
              })
            }
          })
        }
      })
    }
    console.log('默认展开的菜单:', defaultOpeneds.value)
  })

  watchEffect(() => {
    if (device.value === 'mobile') {
      isCollapse.value = true
    } else {
      isCollapse.value = false
    }
  })

  provide('isCollapse', isCollapse)

  // 菜单项选择处理函数
  const selectMenuItem = (index) => {
    console.log('选择菜单项:', index)
    
    // 初始化查询和参数对象
    const query = {}
    const params = {}
    
    // 处理外部链接
    if (index.includes('http://') || index.includes('https://')) {
      window.open(index)
      return
    }
    
    // 处理iframe
    if (index.includes('iframe')) {
      query.src = index
      router.push({
        name: 'Iframe',
        query
      })
      return
    }
    
    // 先尝试使用路径导航
    if (index.startsWith('/')) {
      console.log('使用完整路径导航:', index)
      router.push(index)
      return
    }
    
    // 如果不是完整路径，尝试添加/layout/前缀
    if (typeof index === 'string' && index.includes('tg/')) {
      const fullPath = `/layout/${index}`
      console.log('使用拼接路径导航:', fullPath)
      router.push(fullPath)
      return
    }
    
    // 如果直接是路由名称，使用路由名称导航
    if (routerStore.routers.some(item => item.name === index)) {
      console.log('使用路由名称导航:', index)
      router.push({ name: index })
      return
    }
    
    // 最后尝试直接使用index作为路径
    console.log('使用默认处理导航:', index) 
    try {
      router.push(index)
    } catch (error) {
      console.error('导航错误，返回主页:', error)
      router.push('/layout/tg/dashboard')
    }
  }

  // toggleCollapse函数已在前面定义，此处删除重复声明
</script>

<style lang="scss"></style>
