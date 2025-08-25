<template class="template-report-container">
  <div class="report-container">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1 class="title">检测报告</h1>
    </div>
    <!-- 报告内容卡片 -->
    <div class="report-card">
      <div class="report-list">
        <div 
          v-for="item in reportData" 
          :key="item.key" 
          class="report-item"
        >
          <span class="item-label">{{ item.key }}：</span>
          <span 
            :class="{ 
              'conclusion合格': item.key === '检测结论' && item.value === '合格',
              'conclusion不合格': item.key === '检测结论' && item.value === '不合格',
              'conclusion异常': item.key === '检测结论' && item.value === '异常',
              'conclusion其他': item.key === '检测结论',
              'item-value': true 
            }"
          >
            {{ item.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useReportStore } from '@/stores/reportStore';
import { onMounted } from 'vue';
import { getReportService } from '@/services/reportService';

const reportStore = useReportStore();// 初始化store

// 格式化报告数据的普通方法
const formatReportData = (report) => {
  // 根据实际接口返回格式调整数据
  
  // 检查report是否为数组，如果是则取第一个元素
  const actualReport = Array.isArray(report) ? report[0] : report;
  return [
    { key: '报告编号', value: actualReport?.report_code || '' },
    { key: '工程名称', value: actualReport?.project_name || '' },
    { key: '委托单位', value: actualReport?.client_unit || '' },
    { key: '检测对象', value: actualReport?.inspection_object || '' },
    { key: '检验类型', value: actualReport?.inspection_type || '' },
    { key: '检测项目', value: actualReport?.inspection_items || '' },
    { key: '检测结论', value: actualReport?.inspection_conclusion || '' },
    { key: '报告日期', value: actualReport?.report_date || '' },
    { key: '检测单位', value: actualReport?.inspection_unit || '' },
    { key: '备\u3000\u3000注', value: actualReport?.remarks || '' }
  ];
};

// 加载报告数据的普通方法
const loadReportData = async (reportCode) => {
  if (reportCode) {
    try {
      // 获取reportService实例
      const reportService = getReportService();
      // 调用方法获取报告详情
      const reportDetail = await reportService.handleGetReportByCode(reportCode);
      if (reportDetail.success) {
        ElMessage.success('报告详情获取成功');
      } else {
        ElMessage.error('查询不到该报告！请检查报告编号是否正确。');

      }
      // 格式化报告数据
      return formatReportData(reportDetail?.data || {});
    } catch (error) {
      console.error('获取报告详情失败:', error);
      return [];
    }
  } else {
    ElMessage.error('未提供report_code参数');
    return [];
  }
};

const initData = async () => {
  // 获取URL中的report_code参数
  const route = window.location;
  const params = new URLSearchParams(route.search);
  const reportCode = params.get('report_code');

  // 调用加载报告数据的方法
  return await loadReportData(reportCode);

// 注意：以下代码是组件的核心定义，不能删除
// export default 部分包含组件的基本结构和数据加载逻辑
// 如果删除，组件将无法正常工作
// 若要优化，可以考虑重构，但不能完全删除
};

export default {
    name: 'ShowReportByCode.vue',
    data() {
      return {
        reportData: []
      };
    },
    async mounted() {
      // 调用initData方法并更新reportData
      this.reportData = await initData();
    }
  };
</script>

<style scoped>
/* 最外层容器：占满屏幕 */
.template-report-container {
  min-height: 100vh; 
  width: 100%;
  padding: 16px; 
  background-color: #f5f7fa; 
  box-sizing: border-box;
}

/* 报告容器：居中+限宽 */
.report-container {
  width: 100%;
  max-width: 600px; /* 合理限制宽度，避免手机端过宽 */
  margin: 0 auto; 
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
}

/* 标题栏：简洁居中 */
.header {
  padding: 24px;
  border-bottom: 1px solid #eee;
  text-align: center;
}
.title {
  margin: 0;
  font-size: 20px; 
  font-weight: 600;
  color: #333;
}

/* 内容卡片：内边距+自动高度 */
.report-card {
  padding: 24px;
  box-sizing: border-box;
}

/* 数据列表：flex自动排版 */
.report-list {
  display: flex;
  flex-direction: column;
  gap: 16px; /* 行间距统一 */
}

/* 每一项：内容决定高度 */
.report-item {
  display: flex;
  align-items: center; 
  padding: 12px 0; /* 用内边距控制行高 */
  border-bottom: 1px solid #eee; /* 分隔线增强可读性 */
}

/* 标签：固定宽度+对齐 */
.item-label {
  width: 80px; 
  min-width: 80px; 
  margin-right: 16px; 
  font-weight: 500;
  color: #409eff; 
}

/* 内容：自动填充 */
.item-value {
  flex: 1; 
  color: #666;
  line-height: 1.6; 
  word-break: break-word; /* 长内容换行 */
}

/* 检测结论：绿色高亮 */
.conclusion合格 {
  background-color: #67c23a !important;
  color: #fff !important;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
  display: inline-block;
}

/* 检测结论：不合格 - 红色高亮 */
.conclusion不合格 {
  background-color: #f56c6c!important;
  color: #181414!important;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
}

/* 检测结论：异常 - 橙色高亮 */
.conclusion异常 {
  background-color: #e6a23c!important;
  color: #0e0e0c!important;
  padding: 4px 8px;
  border-radius: 4px;
  text-align: center;
}
.conclusion其他 {
  text-align: center;
  background-color: #ffffff;
  color: #131010!important;
}

/* 小屏幕适配：压缩标签宽度 */
@media (max-width: 375px) {
  .item-label {
    width: 60px; 
    min-width: 60px; 
  }
}
</style>