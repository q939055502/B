<template>
  <div class="table-page-container">
    <!-- 操作栏 -->
    <div class="table-actions">
      <button class="btn-primary" @click="$emit('add-item')" :disabled="!hasCreatePermission">
        <i class="fa fa-plus"></i> 新增
      </button>

      <button class="btn-primary" @click="downloadTemplate">
        <i class="fa fa-download"></i> 下载模板
      </button>

      

      <button class="btn-primary" @click="batchAddReport" :disabled="!hasCreatePermission">
        <i class="fa fa-file-text-o"></i> 批量新增报告
      </button>

      <button class="btn-primary" @click="batchUpdateReport" :disabled="!hasUpdatePermission">
        <i class="fa fa-file-excel-o"></i> 批量更新报告
      </button>

      <button class="btn-primary" v-if="selectedIds.length" @click="handleBatchDownloadQRCode">
        <i class="fa fa-qrcode"></i> 批量下载二维码
      </button>
      
      <button class="btn-primary" v-if="selectedIds.length" @click="handleBatchExportReportData">
        <i class="fa fa-file-excel-o"></i> 批量导出报告数据
      </button>

      <button class="btn-danger" v-if="false&&selectedIds.length" @click="handleBatchDelete">
        <i class="fa fa-trash"></i> 批量删除
      </button>
      
      <!-- 搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入搜索内容"
          size="small"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
          clearable
          @clear="handleClearSearch"
          :class="{ 'clear-active': isClearing }"
        ></el-input>
        <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
      </div>
      
      <!-- 列设置按钮 -->
      <!-- <button class="btn-settings" @click="showColumnSetting = true">
        <i class="fa fa-cog"></i> 列表设置
      </button> -->
      <el-button class="btn-settings" type="primary" size="small" @click="showColumnSetting = true">
        列表设置
      </el-button>

    </div>
    
    <!-- 列设置弹窗 -->
    <div v-if="showColumnSetting" class="modal-overlay" @click="showColumnSetting = false">
      <div class="modal-content" @click.stop>
        <ColumnSetting 
          :columns="columns" 
          @close="showColumnSetting = false"
          @save="updateColumns"
        />
      </div>
    </div>
    
    <!-- 带滚动条的表格容器 -->
    <div class="table-scroll-container">
      <table class="data-table">
        <thead>
          <tr>
            <!-- 固定列 - 复选框 -->
            <th 
              class="checkbox-col" 
              v-if="getVisibleColumns.some(col => col.en !== 'operation')"
              :style="{ minWidth: '50px', maxWidth: '50px' }"
            >
              <input 
                type="checkbox" 
                v-model="selectAll" 
                @change="handleSelectAll"
              >
            </th>
            
            <!-- 动态生成表头 -->
            <th 
              v-for="col in getVisibleColumns" 
              :key="col.en"
              :style="{ 
                minWidth: col.minWidth || '120px',
                width: col.width || 'auto',
                whiteSpace: col.noWrap ? 'nowrap' : 'normal'
              }"
              :class="{
                'fixed-column': col.fixed,
                'left-fixed': col.fixed === 'left',
                'right-fixed': col.fixed === 'right'
              }"
            >
              {{ col.zh }}
              <i 
                v-if="col.sortable" 
                class="fa fa-sort" 
                @click="$emit('sort', col.en)"
              ></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, index) in tableData" 
            :key="row.report_code || index" 
            @mouseenter="row.hover = true" 
            @mouseleave="row.hover = false" 
            :class="{ 'row-hover': row.hover }"
          >
            <!-- 固定列 - 复选框 -->
            <td 
              class="checkbox-col" 
              v-if="getVisibleColumns.some(col => col.en !== 'operation')"
            >
              <input 
                type="checkbox" 
                v-model="selectedIds" 
                :value="row.report_code || row.id"
              ><!-- 复选框 -->
            </td>
            
            <!-- 动态生成表格内容 -->
            <td 
              v-for="col in getVisibleColumns" 
              :key="col.en"
              :style="{ 
                minWidth: col.minWidth || '120px',
                width: col.width || 'auto',
                whiteSpace: col.noWrap ? 'nowrap' : 'normal',
                fontSize: getFontSize(row[col.en], col)
              }"
              :class="{
                'fixed-column': col.fixed,
                'left-fixed': col.fixed === 'left',
                'right-fixed': col.fixed === 'right',
                'long-text': col.en === 'remarks' || col.en === 'conclusion_description'
              }"
            >
              <!-- 特殊处理ID列 - 行号生成 -->
              <template v-if="col.en === 'id'">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </template>
              
              <!-- 状态类特殊显示 -->
              <template v-else-if="col.en === 'is_recheck'">
                <span :class="row[col.en] ? 'tag-yes' : 'tag-no'">
                  {{ row[col.en] ? '是' : '否' }}
                </span>
              </template>
              
              <!-- 报告状态 -->
              <template v-else-if="col.en === 'report_status'">
                <span :class="getStatusClass(row[col.en])">{{ row[col.en] }}</span>
              </template>
              
              <!-- 日期格式化 -->
              <template v-else-if="col.en.includes('date') || col.en.includes('created_at') || col.en.includes('updated_at')">
                {{ formatDate(row[col.en]) }}
              </template>
              
              <!-- 操作列 -->
              <template v-else-if="col.en === 'operation'">
                <div class="action-buttons">
                  <!-- <button class="btn-edit" @click="$emit('edit-item', row)">
                    <el-icon><Edit /></el-icon> 编辑
                  </button> -->
                  <el-button class="btn-edit" type="primary" size="small" @click="$emit('edit-item', row)" :disabled="!hasEditPermission(row)">
                    编辑
                  </el-button>
                  <el-button class="btn-qrcode" type="primary" size="small" @click="downloadQRCode(row)">
                    下载二维码
                  </el-button>
                  <el-button class="btn-delete" type="danger" size="small" @click="handleDeleteItem(row.report_code, row)" :disabled="!hasDeletePermission(row)">
                    删除
                  </el-button>
                </div>
              </template>
              
              <!-- 普通文本 -->
              <template v-else>
                {{ row[col.en] || '-' }}
              </template>
            </td>
          </tr>
          
          <!-- 空状态 -->
          <tr v-if="tableData.length === 0">
            <td 
              :colspan="getVisibleColumns.length + (getVisibleColumns.some(col => col.en !== 'operation') ? 1 : 0)" 
              class="empty-state"
            >
              <i class="fa fa-inbox"></i> 暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <span class="total">共 {{ total }} 条数据</span>
      <div class="page-size-selector">
        <span>每页显示：</span>
        <select :value="pageSize" @change="handlePageSizeChange">
          <option value="10">10条</option>
          <option value="20">20条</option>
          <option value="50">50条</option>
          <option value="100">100条</option>
        </select>
      </div>
      <div class="pagination-controls">
        <button 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        <button 
          v-for="page in pageNumbers"
          :key="page"
          @click="changePage(page)"
          :class="{ 'current-page': page === currentPage }"
        >
          {{ page }}
        </button>
        <button 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { getReportService } from '@/services/reportService';
const reportService = getReportService();
import { Search } from '@element-plus/icons-vue';
import ColumnSetting from './ColumnSetting.vue';
import { ElIcon, ElMessageBox } from 'element-plus';
import { Check, Close } from '@element-plus/icons-vue';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { dictArrayToExcel } from '@/utils/excelParser';
import { usePermission } from '@/utils/usePermission';
const { hasPermission } = usePermission();
// 使用computed确保权限检查响应式更新
const hasCreatePermission = computed(() => hasPermission({ resource: 'inspection_report', action: 'create' }));
// 批量更新权限检查 - 只要有编辑权限就显示，不区分scope
const hasUpdatePermission = computed(() => hasPermission({ resource: 'inspection_report', action: 'edit' }));

// 编辑权限检查函数
const hasEditPermission = (row) => {
  // 确保registrant_id存在且能转换为有效数字
  const registrantId = row.registrant_id ? parseInt(row.registrant_id, 10) : null;
  return hasPermission({
    resource: 'inspection_report',
    action: 'edit',
    scope: 'own',
    id: registrantId
  });
};

// 删除权限检查函数
const hasDeletePermission = (row) => {
  // 确保registrant_id存在且能转换为有效数字
  const registrantId = row.registrant_id ? parseInt(row.registrant_id, 10) : null;
  // console.log('删除按钮',registrantId,"-----",hasPermission({resource: 'inspection_report',action: 'delete',scope: 'own',id: registrantId}))
  return hasPermission({
    resource: 'inspection_report',
    action: 'delete',
    scope: 'own',
    id: registrantId
  });
};

// 搜索相关
const searchKeyword = ref('');
const isClearing = ref(false);

// 搜索处理函数
const handleSearch = () => {
  emit('search', searchKeyword.value);
};

// 清除搜索
const handleClearSearch = () => {
  // 设置清除状态
  isClearing.value = true;
  // 执行清除逻辑
  searchKeyword.value = '';
  emit('search', '');
  // 100ms后移除清除状态
  setTimeout(() => {
    isClearing.value = false;
  }, 100);
}

// 接收父组件参数
const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  }
});

// 事件发射
const emit = defineEmits(['edit-item', 'add-item', 'delete-item', 'page-change', 'sort', 'search']);

// 列设置状态
const showColumnSetting = ref(false);
const columnConfig = ref([...props.columns]);

// 从本地存储加载列设置
watchEffect(() => {
  try {
    const savedColumns = localStorage.getItem('engineeringTableColumns');
    if (savedColumns) {
      const parsed = JSON.parse(savedColumns);
      // 合并保存的设置到当前列配置
      columnConfig.value = columnConfig.value.map(col => {
        const saved = parsed.find(c => c.en === col.en);
        return saved ? { ...col, ...saved } : col;
      });
    }
  } catch (e) {
    console.warn('加载列设置失败，使用默认配置');
  }
});

// 更新列配置并保存到本地存储
const updateColumns = (newColumns) => {
  columnConfig.value = [...newColumns];
  
  // 保存到本地存储，实现持久化
  try {
    localStorage.setItem('engineeringTableColumns', JSON.stringify(columnConfig.value));
  } catch (e) {
    console.warn('无法保存列设置到本地存储');
  }
};

// 获取可见列
const getVisibleColumns = computed(() => {
  return columnConfig.value.filter(col => col.visible !== false);
});

// 复选框状态管理
const selectedIds = ref([]);
const selectAll = computed({
  get() {
    return props.tableData.length > 0 && 
           selectedIds.value.length === props.tableData.length &&
           getVisibleColumns.value.some(col => col.en !== 'operation');
  },
  set(checked) {
    if (getVisibleColumns.value.some(col => col.en !== 'operation')) {
      selectedIds.value = checked ? 
        props.tableData.map(row => row.report_code || row.id) : 
        [];
    }
  }
});

// 处理全选
const handleSelectAll = (e) => {
  selectAll.value = e.target.checked;
};

// 批量删除
const handleBatchDelete = () => {
  if (confirm(`确定要删除选中的 ${selectedIds.value.length} 条数据吗？`)) {
    emit('delete-item', selectedIds.value);
    selectedIds.value = [];
  }
};

// 批量下载二维码
const handleBatchDownloadQRCode = async () => {
  try {
    if (selectedIds.value.length === 0) {
      alert('请先选择要下载二维码的报告');
      return;
    }

    // 获取选中的行数据
    const selectedRows = props.tableData.filter(row => 
      selectedIds.value.includes(row.report_code || row.id)
    );

    // 获取vite.config.js中的urlHeader配置
    const urlHeader = import.meta.env.VITE_API_URL || '';

    // 创建zip实例
    const zip = new JSZip();
    const qrFolder = zip.folder('二维码');

    // 并行生成所有二维码并添加到zip
    const qrPromises = selectedRows.map(async (row) => {
      const reportCode = row.report_code || row.id;
      const qrContent = `${urlHeader}/_report?report_code=${reportCode}`;

      // 生成二维码Data URL
      const dataUrl = await QRCode.toDataURL(qrContent, {
        width: 200,
        margin: 1
      });

      // 提取base64数据
      const base64Data = dataUrl.split(',')[1];
      // 添加到zip文件
      qrFolder.file(`二维码_${reportCode}.png`, base64Data, { base64: true });

      return reportCode;
    });

    // 等待所有二维码生成完成
    await Promise.all(qrPromises);

    // 生成zip文件并下载
    zip.generateAsync({type: 'blob'})
      .then(content => {
        const link = document.createElement('a');
        link.download = '二维码批量下载.zip';
        link.href = URL.createObjectURL(content);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href); // 释放URL对象
      });

  } catch (error) {
    console.error('批量生成二维码失败:', error);
    alert('批量生成二维码失败，请重试');
  }
};

// 分页计算
const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize);
});

const pageNumbers = computed(() => {
  const pages = [];
  // 显示当前页附近的页码，最多显示5个
  let startPage = Math.max(1, props.currentPage - 2);
  let endPage = Math.min(totalPages.value, startPage + 4);
  
  // 调整起始页，确保显示5个页码
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

// 页码变更
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  emit('page-change', page);
};

// 处理每页数量变更
const handlePageSizeChange = (event) => {
  const newPageSize = parseInt(event.target.value);
  emit('page-size-change', newPageSize);
};

// 格式化日期显示
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
};

// 批量新增报告方法
const batchAddReport = async () => {
  try {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .xls';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // 触发文件选择对话框
    fileInput.click();

    // 等待用户选择文件
    const filePromise = new Promise((resolve) => {
      fileInput.onchange = (e) => resolve(e.target.files[0]);
    });

    const selectedFile = await filePromise;
    if (!selectedFile) {
      console.log('未选择文件');
      return;
    }

    // 调用reportService的批量新增方法
    const result = await reportService.handleBatchAddReportsFromExcel(selectedFile);
    if (result.success) {
      ElMessage.success(result.message)
      // 刷新表格数据
      handleSearch();
    } else {
      ElMessage.error('失败',result.message);
    }
  } catch (error) {
    console.error('批量新增报告异常', error);
    ElMessageBox.alert('批量新增报告失败: ' + error.message, '错误', {
      type: 'error'
    });
  }
}

// 批量更新报告方法
const batchUpdateReport = async () => {
  try {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .xls';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // 触发文件选择对话框
    fileInput.click();

    // 等待用户选择文件
    const filePromise = new Promise((resolve) => {
      fileInput.onchange = (e) => resolve(e.target.files[0]);
    });

    const selectedFile = await filePromise;
    if (!selectedFile) {
      console.log('未选择文件');
      return;
    }

    // 调用reportService的批量更新方法
    const result = await reportService.handleBatchUpdateReportsFromExcel(selectedFile);
    if (result.success) {
      ElMessage.success(result.message)
      // 刷新表格数据
      handleSearch();
    } else {
      ElMessage.error('失败',result.message);
    }
  } catch (error) {
    console.error('批量更新报告异常', error);
    ElMessageBox.alert('批量更新报告失败: ' + error.message, '错误', {
      type: 'error'
    });
  }
}

// 根据报告状态获取样式类
const getStatusClass = (status) => {
  // 处理英文状态值
  const statusMap = {
    '草稿': 'tag-draft',
    '已提交': 'tag-submitted',
    '已审核': 'tag-reviewed',
    '已批准': 'tag-approved',
    '已签发': 'tag-issued',
    '已作废': 'tag-canceled', 
    'draft': 'tag-draft',
    'submitted': 'tag-submitted',
    'reviewed': 'tag-reviewed',
    'approved': 'tag-approved',
    'issued': 'tag-issued',
    'canceled': 'tag-canceled',
    'pending': 'tag-pending'// 新增pending状态样式
  };
  return statusMap[status] || 'tag-default';
};

// 根据内容长度动态调整字体大小
const getFontSize = (content, column) => {
  // 不需要调整的列
  if (column.noAutoSize || !content || typeof content !== 'string') {
    return '14px';
  }
  
  // 根据内容长度调整字体大小，最长不超过20个字符
  const length = content.length;
  if (length > 20) {
    return '12px';
  } else if (length > 30) {
    return '11px';
  }
  return '14px';
};

// 处理单个删除
const handleDeleteItem = async (reportCode, row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告编号为 ${reportCode} 的数据吗？`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    );
    emit('delete-item', reportCode);
    // 删除后刷新数据
    handleSearch();
  } catch (error) {
    // 用户取消删除或关闭对话框
  }
};

// 批量导出报告数据
const handleBatchExportReportData = async () => {
  try {
    // 检查是否有选中的数据
    if (!selectedIds.value.length) {
      ElMessage.warning('请先选择要导出的报告数据');
      return;
    }

    // 调用reportService的方法获取报告数据
    const result = await reportService.handleGetReportsByCodes(selectedIds.value);
    if (result.success) {
      ElMessage.success('获取报告数据成功');
      console.log('获取到的报告数据:', result.data);

      // 加载模板文件
      try {
        const response = await fetch('/模板.xlsx');
        if (!response.ok) {
          throw new Error('加载模板文件失败');
        }
        const blob = await response.blob();
        const templateFile = new File([blob], '模板.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // 调用dictArrayToExcel方法导出数据
        // 使用result.data.reports作为数据源，这是包含实际报告数据的数组
        await dictArrayToExcel(result.data.reports, {
          filename: '导出报告数据.xlsx',
          templateFile: templateFile,
          sheetName: '报告数据'
        });
        // 需要提供下载
        ElMessage.success('导出Excel成功');
      } catch (templateError) {
        console.error('处理模板文件或导出Excel失败', templateError);
        ElMessage.error('导出Excel失败: ' + templateError.message);
      }
    } else {
      ElMessage.error(result.message || '获取报告数据失败');
    }
  } catch (error) {
    console.error('获取报告数据异常', error);
    ElMessage.error('获取报告数据失败: ' + error.message);
  }
}

// 下载模板文件
const downloadTemplate = () => {
  try {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = '/填写模板.xlsx';
    link.download = '填写模板.xlsx';
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    
    // 清理
    document.body.removeChild(link);
    
    ElMessage.success('模板下载成功');
  } catch (error) {
    console.error('下载模板失败:', error);
    ElMessage.error('下载模板失败: ' + error.message);
  }
};

// 下载二维码
const downloadQRCode = async (row) => {
  try {
    // 获取vite.config.js中的urlHeader配置
    const urlHeader = import.meta.env.VITE_API_URL || '';
    // 获取当前行的报告编号
    const reportCode = row.report_code || row.id;
    // 拼接二维码内容: urlHeader + /api/_report? + 报告编号
    const qrContent = `${urlHeader}/_report?report_code=${reportCode}`;
    
    // 生成二维码Data URL
    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 200,
      margin: 1
    });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `二维码_${reportCode}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('生成二维码失败:', error);
    alert('生成二维码失败，请重试');
  }
};
</script>

<style scoped>
/* 隐藏可能多余的确认按钮 */
.el-message-box__btns button:not(:first-child):not(:last-child) {
  display: none;
}

.table-page-container {
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  margin: 16px;
}

/* 操作栏样式 */
.table-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 8px 0;
  flex-wrap: wrap;
  align-items: center;
}

/* 搜索框容器样式 */
.search-container {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.search-container .el-input {
  width: 200px;
}

/* 搜索框清除按钮点击反馈 */
.el-input__clear {
  transition: all 0.1s;
}

.clear-active .el-input__clear {
  background-color: #1890ff;
  color: white !important;
  border-radius: 50%;
  transform: scale(1.1);
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #ccc;
}

.btn-primary:hover {
  background-color: #096dd9;
}

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.btn-danger:hover {
  background-color: #d93025;
}

.btn-settings {
  margin-left: auto;
  background-color: #f5f7fa;
  color: #4e5969;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.btn-settings:hover {
  background-color: #e8e8e8;
}

/* 列设置弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 6px;
  overflow: hidden;
}

/* 表格滚动容器 */
.table-scroll-container {
  overflow-x: auto; /* 横向滚动 */
  max-height: 600px; /* 表格最大高度 */
  min-height: 300px; /* 表格最小高度 */
  overflow-y: auto; /* 纵向滚动 */
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

/* 表格样式 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto; /* 自动根据内容调整列宽 */
}

.data-table th,
.data-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
  overflow: hidden; /* 超出隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
}

.data-table th {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #4e5969;
  position: sticky; /* 表头固定 */
  top: 0;
  z-index: 10;
  border-right: 1px solid #e8e8e8;
}

.data-table th:last-child {
  border-right: none;
}

/* 固定列样式 */
.fixed-column {
  position: sticky;
  background-color: #fff;
  z-index: 5;
  border-right: 1px solid #e8e8e8;
}

.left-fixed {
  left: 0;
}

.checkbox-col {
  position: sticky;
  left: 0;
  background-color: #f5f7fa;
  z-index: 10;
  border-right: 1px solid #e8e8e8;
}

/* 下面两个新增的，没起效果，如果出错删除这个 */
.checkbox-col input[type="checkbox"]:checked + label {
  color: #1890ff;
}

.checkbox-col-row-selected {
  background-color: rgba(24, 144, 255, 0.08);
}

.right-fixed {
  right: 0;
  border-left: 1px solid #e8e8e8;
  border-right: none;
}

/* 长文本特殊处理 */
.long-text {
  white-space: normal !important;
  min-height: 40px;
  vertical-align: top;
}

/* 行样式 */
.row-hover {
  background-color: #e3f2fd; /* 悬停背景色 */
    transform: translateY(-2px); /* 轻微上浮效果 */
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2); /* 添加阴影 */
}

/* 操作列样式 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit {
  color: #1890ff;
  border: 1px solid #1890ff;
  background-color: transparent;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.btn-edit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f5f5f5;
  color: #8c8c8c;
  border-color: #d9d9d9;
}

.btn-edit:hover {
  background-color: #e6f7ff;
}

.btn-delete {
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  background-color: transparent;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.btn-delete:hover {
  background-color: #fff2f0;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f5f5f5;
  color: #8c8c8c;
  border-color: #d9d9d9;
}

/* 空状态样式 */
.empty-state {
  height: 200px;
  text-align: center;
  vertical-align: middle;
  color: #86909c;
}

.empty-state i {
  font-size: 24px;
  margin-right: 8px;
  vertical-align: middle;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 8px;
  font-size: 14px;
}

.page-size-selector {
  margin: 0 10px;
  display: flex;
  align-items: center;
}

.page-size-selector select {
  margin-left: 5px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.page-size-selector select:focus {
  outline: none;
  border-color: #1890ff;
}

.total {
  color: #4e5969;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-controls button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination-controls button:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.current-page {
  background-color: #e6f7ff !important;
  border-color: #1890ff !important;
  color: #1890ff !important;
}

/* 标签样式 */
.tag-yes {
  display: inline-block;
  padding: 2px 8px;
  background-color: #f6ffed;
  color: #52c41a;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #b7eb8f;
}

.tag-no {
  display: inline-block;
  padding: 2px 8px;
  background-color: #fff2f0;
  color: #ff4d4f;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #ffccc7;
}

/* 报告状态标签样式 */
.tag-draft {
  background-color: #fffbf0;
  color: #faad14;
  border: 1px solid #ffe58f;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-submitted {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-reviewed {
  background-color: #f0f7ff;
  color: #40a9ff;
  border: 1px solid #94d8ff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-approved {
  background-color: #e6fffb;
  color: #36cfc9;
  border: 1px solid #87e8de;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-issued {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-canceled {
  background-color: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-pending {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.tag-default {
  background-color: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}


</style>
