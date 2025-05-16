<template>
  <div class="status-monitor">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账号状态监控</span>
          <el-button type="primary" size="small" @click="refreshStatuses">刷新</el-button>
        </div>
      </template>
      
      <div class="status-summary">
        <div class="status-item success">
          <div class="status-count">{{ stats.normal }}</div>
          <div class="status-label">在线</div>
        </div>
        <div class="status-item warning">
          <div class="status-count">{{ stats.timeout }}</div>
          <div class="status-label">超时</div>
        </div>
        <div class="status-item info">
          <div class="status-count">{{ stats.offline }}</div>
          <div class="status-label">离线</div>
        </div>
        <div class="status-item danger">
          <div class="status-count">{{ stats.disabled }}</div>
          <div class="status-label">禁用</div>
        </div>
      </div>
      
      <div class="status-chart">
        <div class="monitor-wrapper" v-loading="loading">
          <div v-if="loading">加载中...</div>
          <div v-else-if="recentStatusHistory.length === 0" class="no-data">
            暂无状态数据
          </div>
          <div v-else class="chart-container" ref="chartContainer"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([GridComponent, TooltipComponent, TitleComponent, LegendComponent, LineChart, CanvasRenderer])

export default defineComponent({
  name: 'StatusMonitor',
  
  props: {
    accountType: {
      type: String,
      default: 'crawler', // 'crawler' 或 'private'
      required: true
    }
  },
  
  setup(props) {
    const loading = ref(false)
    const chart = ref(null)
    const chartContainer = ref(null)
    const recentStatusHistory = ref([])
    const timer = ref(null)
    
    // 状态统计信息
    const stats = reactive({
      normal: 0,
      offline: 0,
      timeout: 0,
      disabled: 0
    })
    
    // 生成模拟数据
    const generateRandomData = () => {
      const now = new Date()
      const result = []
      
      // 生成过去24小时，每小时一个点的模拟数据
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        const timeStr = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        
        // 根据账号类型生成不同范围的随机数
        const normalBase = props.accountType === 'crawler' ? 80 : 60
        const normal = Math.floor(Math.random() * 20 + normalBase)
        const offline = Math.floor(Math.random() * 15 + 5)
        const timeout = Math.floor(Math.random() * 10 + 3)
        const disabled = Math.floor(Math.random() * 5 + 1)
        
        result.push({
          time: timeStr,
          normal,
          offline,
          timeout,
          disabled,
          total: normal + offline + timeout + disabled
        })
      }
      
      return result
    }
    
    // 加载状态历史数据
    const loadStatusHistory = async () => {
      loading.value = true
      try {
        // 实际应用中，应从API获取数据
        recentStatusHistory.value = generateRandomData()
        
        // 更新当前统计数据（使用最新的一个点的数据）
        const latestData = recentStatusHistory.value[recentStatusHistory.value.length - 1]
        stats.normal = latestData.normal
        stats.offline = latestData.offline
        stats.timeout = latestData.timeout
        stats.disabled = latestData.disabled
      } catch (error) {
        console.error('加载状态历史数据失败:', error)
        ElMessage.error('加载状态历史数据失败')
      } finally {
        loading.value = false
        nextTick(() => {
          initChart()
        })
      }
    }
    
    // 刷新状态数据
    const refreshStatuses = () => {
      loadStatusHistory()
    }
    
    // 初始化图表
    const initChart = () => {
      if (!chartContainer.value) return
      
      // 如果已经存在图表实例，则销毁它
      if (chart.value) {
        chart.value.dispose()
      }
      
      // 创建新的图表实例
      chart.value = echarts.init(chartContainer.value)
      
      // 准备数据
      const times = recentStatusHistory.value.map(item => item.time)
      const normalData = recentStatusHistory.value.map(item => item.normal)
      const offlineData = recentStatusHistory.value.map(item => item.offline)
      const timeoutData = recentStatusHistory.value.map(item => item.timeout)
      const disabledData = recentStatusHistory.value.map(item => item.disabled)
      
      // 图表配置
      const option = {
        title: {
          text: '账号状态趋势 (24小时)',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            let result = params[0].axisValue + '<br/>';
            params.forEach(param => {
              let color = param.color;
              let value = param.value;
              let seriesName = param.seriesName;
              result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span> ${seriesName}: ${value}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: ['在线', '离线', '超时', '已禁用'],
          top: 'bottom'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: times
        },
        yAxis: {
          type: 'value',
          min: 0,
          minInterval: 1
        },
        series: [
          {
            name: '在线',
            type: 'line',
            stack: '总量',
            data: normalData,
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: '#67C23A' // success color
            }
          },
          {
            name: '离线',
            type: 'line',
            stack: '总量',
            data: offlineData,
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: '#909399' // info color
            }
          },
          {
            name: '超时',
            type: 'line',
            stack: '总量',
            data: timeoutData,
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: '#E6A23C' // warning color
            }
          },
          {
            name: '已禁用',
            type: 'line',
            stack: '总量',
            data: disabledData,
            areaStyle: {},
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: '#F56C6C' // danger color
            }
          }
        ]
      }
      
      // 设置图表配置并渲染
      chart.value.setOption(option)
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    }
    
    // 处理窗口大小变化
    const handleResize = () => {
      if (chart.value) {
        chart.value.resize()
      }
    }
    
    // 自动刷新状态（每5分钟）
    const startAutoRefresh = () => {
      stopAutoRefresh() // 先停止之前的定时器
      timer.value = setInterval(() => {
        refreshStatuses()
      }, 5 * 60 * 1000) // 5分钟刷新一次
    }
    
    // 停止自动刷新
    const stopAutoRefresh = () => {
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
      }
    }
    
    // 监听账号类型变化
    watch(() => props.accountType, () => {
      loadStatusHistory()
    })
    
    // 生命周期钩子
    onMounted(() => {
      loadStatusHistory()
      startAutoRefresh()
    })
    
    onBeforeUnmount(() => {
      stopAutoRefresh()
      // 清理图表和事件监听
      if (chart.value) {
        chart.value.dispose()
        chart.value = null
      }
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      loading,
      chartContainer,
      recentStatusHistory,
      stats,
      refreshStatuses
    }
  }
})
</script>

<style scoped>
.status-monitor {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.status-item {
  text-align: center;
  padding: 15px;
  border-radius: 4px;
  min-width: 100px;
}

.status-count {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-label {
  font-size: 14px;
}

.status-item.success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67C23A;
}

.status-item.warning {
  background-color: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.status-item.info {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.status-item.danger {
  background-color: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
}

.status-chart {
  margin-top: 20px;
}

.monitor-wrapper {
  min-height: 300px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: #909399;
  font-size: 14px;
}
</style>
