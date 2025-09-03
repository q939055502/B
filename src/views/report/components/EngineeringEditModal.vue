<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container">
      <!-- 弹窗头部 -->
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditMode ? '编辑报告数据' : '新增报告数据' }}</h2>
        <!-- <button class="modal-close" @click="$emit('close')">
          <i class="fa fa-times"></i>
        </button> -->
        <el-button class="modal-close" type="primary" size="small" @click="$emit('close')">
          <el-icon>
            <Close />
          </el-icon>
        </el-button>
      </div>
      
      <!-- 弹窗内容（带滚动条） -->
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 1. 基础标识区 -->
          <div class="form-section">
              <h3 class="section-title">基础标识信息</h3>
              <div class="form-grid">
                <FormItem label="报告编号" required :disabled="isEditMode">
                  <input 
                    type="text" 
                    v-model="formData.report_code" 
                    class="form-input"
                    :disabled="isEditMode"
                    required
                    ref="reportCodeRef"
                  >
                </FormItem>
                
                <FormItem label="委托编号">
                  <input 
                    type="text" 
                    v-model="formData.commission_code" 
                    class="form-input"
                  >
                </FormItem>
              </div>
            </div>
          
          <!-- 2. 工程基本信息区 -->
          <div class="form-section">
            <h3 class="section-title">工程基本信息</h3>
            <div class="form-grid">
              <FormItem label="工程名称" required>
                  <input 
                    type="text" 
                    v-model="formData.project_name" 
                    class="form-input"
                    required
                    ref="projectNameRef"
                  >
                </FormItem>
              
              <FormItem label="工程地址">
                <input 
                  type="text" 
                  v-model="formData.project_location" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="工程类型">
                <select v-model="formData.project_type" class="form-select">
                  <option value="">请选择</option>
                  <option value="房屋建筑工程">房屋建筑工程</option>
                  <option value="市政基础设施工程">市政基础设施工程</option>
                  <option value="公路工程">公路工程</option>
                  <option value="水利工程">水利工程</option>
                  <option value="铁路工程">铁路工程</option>
                  <option value="其他">其他</option>
                </select>
              </FormItem>
              
              <FormItem label="工程阶段">
                <select v-model="formData.project_stage" class="form-select">
                  <option value="">请选择</option>
                  <option value="设计阶段">设计阶段</option>
                  <option value="施工准备阶段">施工准备阶段</option>
                  <option value="基础施工阶段">基础施工阶段</option>
                  <option value="主体施工阶段">主体施工阶段</option>
                  <option value="装饰装修阶段">装饰装修阶段</option>
                  <option value="竣工验收阶段">竣工验收阶段</option>
                </select>
              </FormItem>
              
              <FormItem label="备注" span="2">
                <textarea 
                  v-model="formData.remarks" 
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </FormItem>
            </div>
          </div>
          
          <!-- 3. 参与单位信息区 -->
          <div class="form-section">
            <h3 class="section-title">参与单位信息</h3>
            <div class="form-grid">
              <FormItem label="建设单位">
                <input 
                  type="text" 
                  v-model="formData.construction_unit" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="施工单位">
                <input 
                  type="text" 
                  v-model="formData.contractor" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="监理单位">
                <input 
                  type="text" 
                  v-model="formData.supervisor" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="见证单位">
                <input 
                  type="text" 
                  v-model="formData.witness_unit" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="委托单位" required>
                  <input 
                    type="text" 
                    v-model="formData.client_unit" 
                    class="form-input"
                    required
                    ref="clientUnitRef"
                  >
                </FormItem>
              
              <FormItem label="委托人">
                <input 
                  type="text" 
                  v-model="formData.client_contact" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="检测单位" required>
                  <input 
                    type="text" 
                    v-model="formData.inspection_unit" 
                    class="form-input"
                    required
                    ref="inspectionUnitRef"
                  >
                </FormItem>
              
              <FormItem label="联系地址">
                <input 
                  type="text" 
                  v-model="formData.contact_address" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="联系电话">
                <input 
                  type="text" 
                  v-model="formData.contact_phone" 
                  class="form-input"
                >
              </FormItem>
              
               
              <FormItem label="业务员">
                <input 
                  type="text" 
                  v-model="formData.salesperson" 
                  class="form-input"
                >
              </FormItem>
            </div>
          </div>
          
          <!-- 4. 检测对象与参数区 -->
          <div class="form-section">
            <h3 class="section-title">检测对象与参数</h3>
            <div class="form-grid">
              <FormItem label="检测对象" required>
                  <input 
                    type="text" 
                    v-model="formData.inspection_object" 
                    class="form-input"
                    required
                    ref="inspectionObjectRef"
                  >
                </FormItem>
              
              <FormItem label="检测部位">
                <input 
                  type="text" 
                  v-model="formData.object_part" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="对象规格">
                <input 
                  type="text" 
                  v-model="formData.object_spec" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="设计要求">
                <input 
                  type="text" 
                  v-model="formData.design_spec" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="检验类型" required>
                  <select v-model="formData.inspection_type" class="form-select" required ref="inspectionTypeRef">
                    <option value="">请选择</option>
                    <option value="常规检验">常规检验</option>
                    <option value="抽样检验">抽样检验</option>
                    <option value="专项检验">专项检验</option>
                    <option value="见证检验">见证检验</option>
                    <option value="复检">复检</option>
                  </select>
                </FormItem>
              
              <FormItem label="检测项目" required>
                  <input 
                    type="text" 
                    v-model="formData.inspection_items" 
                    class="form-input" 
                    required
                    ref="inspectionItemsRef"
                  >
                </FormItem>
              
              <FormItem label="检测项详情" span="2">
                <textarea 
                  v-model="formData.test_items" 
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </FormItem>
              
              <FormItem label="检测数量">
                <input 
                  type="number" 
                  v-model="formData.inspection_quantity" 
                  class="form-input"
                  min="0"
                >
              </FormItem>
              
              <FormItem label="计量单位">
                <input 
                  type="text" 
                  v-model="formData.measurement_unit" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="抽样方式">
                <select v-model="formData.sampling_method" class="form-select">
                  <option value="">请选择</option>
                  <option value="随机抽样">随机抽样</option>
                  <option value="分层抽样">分层抽样</option>
                  <option value="系统抽样">系统抽样</option>
                  <option value="全数检验">全数检验</option>
                  <option value="指定抽样">指定抽样</option>
                </select>
              </FormItem>
              
              <FormItem label="抽样人员">
                <input 
                  type="text" 
                  v-model="formData.sampler" 
                  class="form-input"
                >
              </FormItem>
            </div>
          </div>
          
          <!-- 5. 时间流程区（使用日历选择器） -->
          <div class="form-section">
            <h3 class="section-title">时间信息</h3>
            <div class="form-grid">
              <FormItem label="受理日期">
                <input 
                  type="date" 
                  v-model="formData.acceptance_date" 
                  class="form-input date-input"
                >
              </FormItem>
              
              <FormItem label="委托日期">
                <input 
                  type="date" 
                  v-model="formData.commission_date" 
                  class="form-input date-input"
                >
              </FormItem>
              
              <FormItem label="抽样日期">
                <input 
                  type="date" 
                  v-model="formData.sampling_date" 
                  class="form-input date-input"
                >
              </FormItem>
              
              <FormItem label="开始日期">
                <input 
                  type="date" 
                  v-model="formData.start_date" 
                  class="form-input date-input"
                >
              </FormItem>
              
              <FormItem label="结束日期">
                <input 
                  type="date" 
                  v-model="formData.end_date" 
                  class="form-input date-input"
                >
              </FormItem>
              
              <FormItem label="检测完成日期">
                <input 
                  type="date" 
                  v-model="formData.tester_date" 
                  class="form-input date-input"
                >
              </FormItem>
              

              
              <FormItem label="报告日期" required>
                  <input 
                    type="date" 
                    v-model="formData.report_date" 
                    class="form-input date-input" 
                    required
                    ref="reportDateRef"
                  >
                </FormItem>
              
              <FormItem label="签发日期">
                <input 
                  type="date" 
                  v-model="formData.issue_date" 
                  class="form-input date-input"
                >
              </FormItem>
            </div>
          </div>
          
          <!-- 6. 人员信息区 -->
          <div class="form-section">
            <h3 class="section-title">人员信息</h3>
            <div class="form-grid">
              <FormItem label="检测员">
                <input 
                  type="text" 
                  v-model="formData.inspector" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="审核人">
                <input 
                  type="text" 
                  v-model="formData.reviewer" 
                  class="form-input"
                >
              </FormItem>
              
              <FormItem label="批准人">
                <input 
                  type="text" 
                  v-model="formData.approver" 
                  class="form-input"
                >
              </FormItem>
               
              <FormItem label="审核日期">
                <input 
                  type="date" 
                  v-model="formData.review_date" 
                  class="form-input date-input"
                >
              </FormItem>
               
              <FormItem label="批准日期">
                <input 
                  type="date" 
                  v-model="formData.approve_date" 
                  class="form-input date-input"
                >
              </FormItem>
            </div>
          </div>
          
          <!-- 7. 结果与状态区 -->
          <div class="form-section">
            <h3 class="section-title">检测结果与状态</h3>
            <div class="form-grid">
              <FormItem label="是否复检">
                <select v-model="formData.is_recheck" class="form-select">
                  <option value="">请选择</option>
                  <option value="true">是</option>
                  <option value="false">否</option>
                </select>
              </FormItem>
              
              <FormItem label="检测结果" required>
                  <input v-model="formData.inspection_conclusion" class="form-input" required ref="inspectionConclusionRef" placeholder="请输入检测结果">
                </FormItem>
              
              <FormItem label="结论描述" span="2">
                <textarea 
                  v-model="formData.conclusion_description" 
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </FormItem>
              
              <FormItem label="报告状态">
                <select v-model="formData.report_status" class="form-select">
                  <option value="">请选择</option>
                  <option value="草稿">草稿</option>
                  <option value="已提交">已提交</option>
                  <option value="已审核">已审核</option>
                  <option value="已批准">已批准</option>
                  <option value="已签发">已签发</option>
                  <option value="已作废">已作废</option>
                </select>
              </FormItem>
              
              <FormItem label="附件路径">
                <input 
                  type="text" 
                  v-model="formData.attachment_paths" 
                  class="form-input"
                  placeholder="多个路径用逗号分隔"
                >
              </FormItem>
              
              <FormItem label="资质证书编号">
                <input 
                  type="text" 
                  v-model="formData.certificate_no" 
                  class="form-input"
                >
              </FormItem>
            </div>
          </div>
        </form>
      </div>
      
      <!-- 弹窗底部 -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">取消</button>
        <button class="btn-save" @click="handleSubmit">提交</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import FormItem from './FormItem.vue';
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  isEditMode: {
    type: Boolean,
    required: true
  }
});

// 表单数据
const formData = ref({});

// 直接使用props中的isEditMode状态
const isEditMode = computed(() => props.isEditMode);

// 监听初始数据变化，同步到表单
watch(
  () => props.initialData,
  (newVal) => {
    // 深拷贝初始数据到表单
    formData.value = JSON.parse(JSON.stringify(newVal));
    
    // 新增模式下设置默认值
    if (!isEditMode.value) {
      const today = new Date().toISOString().split('T')[0];
      formData.value = {
        ...formData.value,
        report_status: '草稿',
        is_recheck: 'false',
        commission_date: today,
        registrant: '',
        salesperson: '',
        review_date: '',
        approve_date: ''
      };
    }
  },
  { immediate: true }
);

const emit = defineEmits(['close', 'save']);

// 处理表单提交
// 创建ref引用
const reportCodeRef = ref(null);
const projectNameRef = ref(null);
const clientUnitRef = ref(null);
const inspectionObjectRef = ref(null);
const inspectionTypeRef = ref(null);
const inspectionItemsRef = ref(null);
const inspectionConclusionRef = ref(null);
const reportDateRef = ref(null);
const inspectionUnitRef = ref(null);

// 处理表单提交
  const handleSubmit = () => {
    // 简单验证
    if (!formData.value.report_code) {
      
      ElMessage.warning('请填写报告编号');
      reportCodeRef.value?.focus();
      return;
    }
    if (!formData.value.project_name) {
      alert('请填写工程名称');
      projectNameRef.value?.focus();
      return;
    }
    if (!formData.value.client_unit) {
      alert('请填写委托单位');
      clientUnitRef.value?.focus();
      return;
    }
    if (!formData.value.inspection_object) {
      alert('请填写检测对象');
      inspectionObjectRef.value?.focus();
      return;
    }
    if (!formData.value.inspection_type) {
      alert('请选择检验类型');
      inspectionTypeRef.value?.focus();
      return;
    }
    if (!formData.value.inspection_items) {
      alert('请填写检测项目');
      inspectionItemsRef.value?.focus();
      return;
    }
    if (!formData.value.inspection_conclusion) {
      alert('请选择检测结果');
      inspectionConclusionRef.value?.focus();
      return;
    }
    if (!formData.value.report_date) {
      alert('请选择报告日期');
      reportDateRef.value?.focus();
      return;
    }
    if (!formData.value.inspection_unit) {
      alert('请填写检测单位');
      inspectionUnitRef.value?.focus();
      return;
    }
  // 处理日期格式、布尔值和数字类型
  const submitData = {
    ...formData.value,
    is_recheck: formData.value.is_recheck === 'true',
    // 将数字类型字段转换为Number
    inspection_quantity: formData.value.inspection_quantity !== undefined && formData.value.inspection_quantity !== null && formData.value.inspection_quantity !== '' ? Number(formData.value.inspection_quantity) : null,

  };

  
  // 提交数据
  emit('save', submitData);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center; /* 垂直居中 */
  padding: 20px;
  z-index: 1000;
  overflow-y: auto;
}

/* 模态框容器样式 */
.modal-container {
  width: 100%;
  max-width: min(90vw, 1400px); /* 更宽的水平占比 */
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  margin: 20px auto; /* 减少上下边距 */
}

/* 模态框头部样式 */
.modal-header {
  padding: 16px 20px; /* 内边距16px 20px */
  border-bottom: 1px solid #e8e8e8; /* 底部边框 */
  display: flex; /* 使用flex布局 */
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中 */
}

/* 模态框标题样式 */
.modal-title {
  margin: 0; /* 无边距 */
  font-size: 18px; /* 字体大小18px */
  font-weight: 500; /* 字体粗细500 */
  color: #1d2129; /* 字体颜色 */
}

/* 关闭按钮样式 */
.modal-close {
  background: none; /* 无背景 */
  border: none; /* 无边框 */
  width: 32px; /* 宽度32px */
  height: 32px; /* 高度32px */
  border-radius: 50%; /* 圆形按钮 */
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  cursor: pointer; /* 鼠标指针为手型 */
  color: #86909c; /* 字体颜色 */
  transition: all 0.2s; /* 过渡效果0.2s */
}

/* 关闭按钮悬停样式 */
.modal-close:hover {
  background-color: #e3f2fd; /* 悬停背景色 */
  color: #1890ff; /* 悬停字体颜色 */
  transform: scale(1.1); /* 缩放1.1倍 */
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2); /* 悬停阴影 */
  transition: all 0.2s ease; /* 过渡效果0.2s */
}

/* 带滚动条的内容区域 */
.modal-body {
  padding: 20px;
  max-height: calc(85vh - 120px); /* 更高的内容区域 */
  overflow-y: auto;
  flex: 1;
}

/* 表单部分样式 */
.form-section {
  margin-bottom: 24px; /* 下外边距24px */
}

/* 表单部分标题样式 */
.section-title {
  font-size: 16px; /* 字体大小16px */
  color: #1d2129; /* 字体颜色 */
  margin: 0 0 16px 0; /* 下外边距16px */
  padding-bottom: 8px; /* 下内边距8px */
  border-bottom: 1px solid #e8e8e8; /* 底部边框 */
}

/* 表单网格布局样式 */
.form-grid {
  display: grid; /* 使用grid布局 */
  grid-template-columns: repeat(2, 1fr); /* 两列等宽 */
  gap: 16px; /* 网格间距16px */
}

/* 占两列的表单项 */
.form-item[data-span="2"] {
  grid-column: span 2; /* 跨越两列 */
}

/* 输入框和选择框样式 */
.form-input, .form-select {
  padding: 8px 12px; /* 内边距8px 12px */
  border: 1px solid #d9d9d9; /* 边框 */
  border-radius: 4px; /* 圆角4px */
  font-size: 14px; /* 字体大小14px */
  width: 100%; /* 宽度100% */
  box-sizing: border-box; /* 盒模型为border-box */
  transition: border-color 0.2s; /* 边框颜色过渡效果0.2s */
}

/* 输入框和选择框聚焦样式 */
.form-input:focus, .form-select:focus {
  outline: none; /* 无默认轮廓 */
  border-color: #1890ff; /* 聚焦边框颜色 */
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2); /* 聚焦阴影 */
}

/* 文本域样式 */
.form-textarea {
  padding: 8px 12px; /* 内边距8px 12px */
  border: 1px solid #d9d9d9; /* 边框 */
  border-radius: 4px; /* 圆角4px */
  font-size: 14px; /* 字体大小14px */
  width: 100%; /* 宽度100% */
  box-sizing: border-box; /* 盒模型为border-box */
  resize: vertical; /* 允许垂直调整大小 */
  transition: border-color 0.2s; /* 边框颜色过渡效果0.2s */
}

/* 文本域聚焦样式 */
.form-textarea:focus {
  outline: none; /* 无默认轮廓 */
  border-color: #1890ff; /* 聚焦边框颜色 */
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2); /* 聚焦阴影 */
}

/* 日期输入框样式 */
.date-input {
  padding: 7px 12px; /* 调整日期输入框的内边距以匹配其他输入框 */
}

/* 模态框底部样式 */
.modal-footer {
  padding: 16px 20px; /* 内边距16px 20px */
  border-top: 1px solid #e8e8e8; /* 顶部边框 */
  display: flex; /* 使用flex布局 */
  justify-content: flex-end; /* 右对齐 */
  gap: 10px; /* 间距10px */
}

/* 取消按钮样式 */
.btn-cancel {
  padding: 8px 16px; /* 内边距8px 16px */
  border: 1px solid #d9d9d9; /* 边框 */
  background-color: #fff; /* 白色背景 */
  border-radius: 4px; /* 圆角4px */
  cursor: pointer; /* 鼠标指针为手型 */
  font-size: 14px; /* 字体大小14px */
  transition: all 0.2s; /* 过渡效果0.2s */
}

/* 取消按钮悬停样式 */
.btn-cancel:hover {
  border-color: #1890ff; /* 悬停边框颜色 */
  color: #1890ff; /* 悬停字体颜色 */
}

/* 保存按钮样式 */
.btn-save {
  background-color: #1890ff; /* 蓝色背景 */
  color: #fff; /* 白色字体 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 圆角4px */
  padding: 8px 16px; /* 内边距8px 16px */
  cursor: pointer; /* 鼠标指针为手型 */
  font-size: 14px; /* 字体大小14px */
  transition: background-color 0.2s; /* 背景颜色过渡效果0.2s */
}

/* 保存按钮悬停样式 */
.btn-save:hover {
  background-color: #096dd9; /* 悬停背景颜色（深蓝色） */
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr; /* 单列布局 */
  }
  
  .form-item[data-span="2"] {
    grid-column: span 1; /* 跨越一列 */
  }
}
</style>
