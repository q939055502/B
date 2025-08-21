<template>
  <div class="engineering-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h2 class="page-title">工程检测数据管理</h2>
          <div class="page-description"></div>
        </div>
        <button @click="navigateToHome" class="home-button">返回主页</button>
      </div>
    </div>
    
    <!-- 表格组件 -->
    <MainTable 
      :table-data="tableData"
      :columns="columns"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @edit-item="handleEditItem"
      @add-item="handleAddItem"
      @delete-item="handleDeleteItem"
      @page-change="handlePageChange"
      @search="handleSearch"
      @page-size-change="handlePageSizeChange"
    />
    
    <!-- 编辑弹窗 -->
    <EngineeringEditModal 
      :visible="isModalVisible"
      :initial-data="currentItem"
      :is-edit-mode="isEditMode"
      class="engineering-edit-modal"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

import MainTable from './components/MainTable.vue';
import EngineeringEditModal from './components/EngineeringEditModal.vue';
import { useReportStore } from '@/stores/reportStore';
import { getReportService } from '@/services/reportService'; // 导入reportService

// 初始化router
const router = useRouter();
const reportService = getReportService(); // 创建reportService实例

// 导航到主页
const navigateToHome = () => {
  router.push('/');
};

// 定义列配置 - 包含所有表头信息
const columns = ref([
  { en: 'id', zh: 'ID', fixed: 'left', visible: true, minWidth: '80px', noAutoSize: true },
  { en: 'report_code', zh: '报告编号', visible: true, minWidth: '160px', noAutoSize: true },
  { en: 'project_name', zh: '工程名称', visible: true, minWidth: '200px' },
  { en: 'project_location', zh: '工程地址', visible: true, minWidth: '250px' },
  { en: 'project_type', zh: '工程类型', visible: true, minWidth: '120px' },
  { en: 'project_stage', zh: '工程阶段', visible: true, minWidth: '120px' },
  { en: 'construction_unit', zh: '建设单位', visible: true, minWidth: '180px' },
  { en: 'contractor', zh: '施工单位', visible: true, minWidth: '180px' },
  { en: 'supervisor', zh: '监理单位', visible: true, minWidth: '180px' },
  { en: 'witness_unit', zh: '见证单位', visible: false, minWidth: '180px' },
  { en: 'client_unit', zh: '委托单位', visible: true, minWidth: '180px' },
  { en: 'client_contact', zh: '委托人', visible: true, minWidth: '120px' },
  { en: 'remarks', zh: '备注', visible: false, minWidth: '200px', noWrap: false ,defaultVisible: false},
  { en: 'acceptance_date', zh: '受理日期', visible: true, minWidth: '130px', noAutoSize: true },
  { en: 'commission_date', zh: '委托日期', visible: true, minWidth: '130px', noAutoSize: true },
  { en: 'commission_code', zh: '委托编号', visible: true, minWidth: '160px' },
  { en: 'inspection_unit', zh: '检测单位', visible: true, minWidth: '180px' },
  { en: 'contact_address', zh: '联系地址', visible: false, minWidth: '200px' },
  { en: 'contact_phone', zh: '联系电话', visible: false, minWidth: '130px' },
  { en: 'inspection_object', zh: '检测对象', visible: true, minWidth: '150px' },
  { en: 'object_part', zh: '检测部位', visible: true, minWidth: '150px' },
  { en: 'object_spec', zh: '对象规格', visible: false, minWidth: '150px' },
  { en: 'design_spec', zh: '设计要求', visible: false, minWidth: '150px' },
  { en: 'inspection_type', zh: '检验类型', visible: true, minWidth: '120px' },
  { en: 'inspection_items', zh: '检测项目', visible: true, minWidth: '180px' },
  { en: 'test_items', zh: '检测项详情', visible: false, minWidth: '200px', noWrap: false },
  { en: 'inspection_quantity', zh: '检测数量', visible: true, minWidth: '100px', noAutoSize: true },
  { en: 'measurement_unit', zh: '计量单位', visible: true, minWidth: '100px' },
  { en: 'inspection_conclusion', zh: '检测结论', visible: true, minWidth: '150px' },
  { en: 'conclusion_description', zh: '结论描述', visible: false, minWidth: '200px', noWrap: false ,defaultVisible: false},
  { en: 'is_recheck', zh: '是否复检', visible: true, minWidth: '100px', noAutoSize: true },
  { en: 'sampling_method', zh: '抽样方式', visible: false, minWidth: '120px' },
  { en: 'sampling_date', zh: '抽样日期', visible: false, minWidth: '130px', noAutoSize: true },
  { en: 'sampler', zh: '抽样人员', visible: false, minWidth: '120px' },
  { en: 'start_date', zh: '开始日期', visible: true, minWidth: '130px', noAutoSize: true },
  { en: 'end_date', zh: '结束日期', visible: true, minWidth: '130px', noAutoSize: true },
  { en: 'inspector', zh: '检测员', visible: true, minWidth: '120px' },
  { en: 'tester_date', zh: '检测完成日期', visible: false, minWidth: '130px', noAutoSize: true },
  { en: 'reviewer', zh: '审核人', visible: true, minWidth: '120px' },
  { en: 'review_date', zh: '审核日期', visible: false, minWidth: '130px', noAutoSize: true },
  { en: 'approver', zh: '批准人', visible: true, minWidth: '120px' },
  { en: 'approve_date', zh: '批准日期', visible: false, minWidth: '130px', noAutoSize: true },
  { en: 'report_date', zh: '报告日期', visible: true, minWidth: '130px', noAutoSize: true },
  { en: 'issue_date', zh: '签发日期', visible: false, minWidth: '130px', noAutoSize: true },
  { en: 'report_status', zh: '报告状态', visible: true, minWidth: '120px', noAutoSize: true },
  { en: 'attachment_paths', zh: '附件路径', visible: false, minWidth: '200px' ,defaultVisible: false},
  { en: 'certificate_no', zh: '资质证书编号', visible: false, minWidth: '160px' },
  { en: 'created_at', zh: '创建时间', visible: false, minWidth: '150px', noAutoSize: true },
  { en: 'registrant', zh: '登记人', visible: false, minWidth: '120px' },
  { en: 'last_modified_by', zh: '最后修改人', visible: false, minWidth: '150px', noAutoSize: true },
  { en: 'updated_at', zh: '更新时间', visible: false, minWidth: '150px', noAutoSize: true },
  { en: 'salesperson', zh: '业务员', visible: false, minWidth: '120px' },
  { en: 'operation', zh: '操作', fixed: 'right', visible: true, minWidth: '180px', noAutoSize: true },
  { en: 'registrant_id', zh: '登记人ID', visible: false, minWidth: '120px',defaultVisible: false }
]);//表格列配置




// 搜索关键词
const searchKeyword = ref('');

// 表格数据 从store中获取
const reportStore = useReportStore();// 初始化store
const tableData = computed(() => reportStore.tableData);
const total = computed(() => reportStore.total);
const pageSize = computed(() => reportStore.pageSize);
const currentPage = computed(() => reportStore.currentPage);



// 弹窗状态
const isModalVisible = ref(false);//弹窗是否可见
const currentItem = ref({});//当前选中项
const isEditMode = ref(false); // 明确表示编辑/新增状态，true为编辑，false为新增

// 初始化数据的异步函数
const initData = async () => {
  await reportService.handleGetReportsList(); // 直接调用service层方法
};
// 在onMounted钩子中调用初始化函数
onMounted(async () => {
  await initData();
  const storedColumns = localStorage.getItem('engineeringTableColumns');
  if (storedColumns) {
    // 将读取到的数据解析并赋值给columns，覆盖默认配置
    columns.value = JSON.parse(storedColumns);
  }
});




// 处理搜索
const handleSearch = (keyword) => {
  searchKeyword.value = keyword;
  reportService.handleGetReportsList({
    page: 1,
    keyword: searchKeyword.value
  });
};

// 处理分页
const handlePageChange = (page) => {
  reportService.handleGetReportsList({
    page: page,
    keyword: searchKeyword.value
  });
}

// 处理每页数量变更
const handlePageSizeChange = (newPageSize) => {
  reportStore.updateListSettings({
    pageSize: newPageSize,
    currentPage: 1 // 重置为第一页
  });
  reportService.handleGetReportsList({
    page: 1,
    pageSize: newPageSize,
    keyword: searchKeyword.value
  });
};



// 处理编辑
const handleEditItem = (item) => {
  currentItem.value = { ...item };
  isEditMode.value = true; // 设置为编辑模式
  isModalVisible.value = true;
};



// 处理新增
const handleAddItem = () => {
  currentItem.value = {
    report_status: '草稿',
    is_recheck: false
  };
  isEditMode.value = false; // 设置为新增模式
  isModalVisible.value = true;
};

// 关闭弹窗
const closeModal = () => {
  isModalVisible.value = false;
};

// 处理保存
const handleSave = async (item) => {
  try {
    if (isEditMode.value) {
      // 编辑操作
      
      const isSuccess = await reportService.handleUpdateExistingReport(item.report_code, item);
      if (isSuccess.success) {
        ElMessage.success('报告更新成功');
      }else{
        ElMessage.error('报告更新失败');
      }
    } else {
      // 新增操作
      const isSuccess = await reportService.handleAddNewReport(item);
      if (isSuccess) {
        ElMessage.success('新增成功');
      }else{
        ElMessage.error('新增失败');
      }
    }
    // 刷新数据
    await reportService.handleGetReportsList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    });
    closeModal();
  } catch (error) {
    console.error('保存失败:', error);
    alert(`保存失败: ${error.message || '未知错误'}`);
  }
};

// 处理删除
const handleDeleteItem = async (ids) => {
  // 支持单个ID或ID数组
  const idList = Array.isArray(ids) ? ids : [ids];
  
  try {
    if (idList.length === 1) {
      await reportService.handleDeleteExistingReport(idList[0]);
    } else {
      await reportService.handleBatchDeleteExistingReports(idList);
    }
    // alert(`成功删除 ${idList.length} 条数据`);
    ElMessage.success(`成功删除 ${idList.length} 条数据`);
    await reportService.handleGetReportsList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    });
  } catch (error) {
    console.error('删除失败:', error);
    alert(`删除失败: ${error.message || '未知错误'}`);
  }
};
</script>







<style scoped>


.engineering-edit-modal {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 可选：同时水平居中 */
}



.engineering-management {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.home-button {
  padding: 6px 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.home-button:hover {
  background-color: #66b1ff;
}

.page-header {
  padding: 0 0 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 500;
  color: #1d2129;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #86909c;
}
</style>
