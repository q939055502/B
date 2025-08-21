// 引入必要的依赖
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getReportService } from '../services/reportService';

// 导入表格头配置 - 暂时注释，因为reportTableHead文件不存在
// import { tableheads } from './reportTableHead';

// 临时定义tableheads，实际应从正确文件导入或重新实现
const tableheads = [];

// 报告管理仓库
export const useReportStore = defineStore('report', () => {
  // 定义表格数据和分页状态变量
  const tableData = ref([]); // 表格数据
  const total = ref(0); // 总数据量
  const pageSize = ref(10); // 每页数据量
  const currentPage = ref(1); // 当前页码
  const searchKeyword = ref(''); // 搜索关键词
  const loading = ref(false); // 加载状态
  const error = ref(null); // 错误信息
  const homePageReportList = []; // 首页报告列表

  // 更新列表设置
  const updateListSettings = (newSettings) => {
    console.log('更新列表设置:', newSettings);
    // 更新分页状态变量
    if (newSettings.pageSize) {
      pageSize.value = parseInt(newSettings.pageSize);
    }
    if (newSettings.currentPage) {
      currentPage.value = parseInt(newSettings.currentPage);
    }
    // 保存设置到localStorage
    localStorage.setItem('listSettings', JSON.stringify(newSettings));
  };

  return {
    // 暴露状态变量
    tableData,
    total,
    pageSize,
    currentPage,
    searchKeyword,
    loading,
    error,
    tableheads,

    // 暴露方法
    updateListSettings,
  };
});
// 初始化数据
// const initData = async () => {
//   await getReportService().handleGetReportsList();
// };

