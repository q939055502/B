<template>
  <div class="column-setting">
    <div class="setting-header">
      <h3>列表设置</h3>
      <button class="close-btn" @click="emit('close')">
        <!-- <i class="fa fa-times"></i>    原来的-->
        <el-icon class="close-icon"><Close /></el-icon>
      </button>
    </div>
    
    <div class="setting-body">
      <div class="setting-section">
        <h4>显示列</h4>
        <div class="column-checkboxes">
          <label 
            v-for="(col, index) in filteredColumns" 
            :key="index" 
            class="column-checkbox"
            :class="{ 'fixed-column': col.fixed }"
          >
            <input 
              type="checkbox" 
              v-model="col.visible" 
              :disabled="col.fixed"
            >
            <span>{{ col.zh }}</span>
            <span v-if="col.fixed" class="fixed-tag">固定</span>
          </label>
        </div>
      </div>
    </div>
    
    <div class="setting-footer">
      <button class="btn-reset" :class="{ 'btn-reset-active': isResetting }" @click="handleReset">重置默认</button>
      <button class="btn-save" @click="saveSettings">保存设置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus'; // 引入Element的消息提示组件
import { ElIcon } from 'element-plus';
import { Check, Close } from '@element-plus/icons-vue';

// 过滤掉registrant_id列
const filteredColumns = computed(() => {
  return props.columns.filter(col => col.en !== 'registrant_id');
});

// 定义要发出的事件
const emit = defineEmits(['save', 'close']);

const props = defineProps({
  columns: {
    type: Array,
    required: true
  }
});

// 深拷贝列配置，避免直接修改props
const columnSettings = ref([...props.columns]);

// 监听props变化，同步更新
watch(
  () => props.columns,
  (newVal) => {
    columnSettings.value = [...newVal];
  },
  { deep: true }
);

// 重置为默认显示
// 只重置列表中列的可见性设置，不修改本地存储
// 重置按钮状态
const isResetting = ref(false);

// 处理重置点击
const handleReset = () => {
  // 设置点击状态
  isResetting.value = true;
  
  // 执行重置逻辑
  resetColumns();
  
  // 100ms后移除点击状态
  setTimeout(() => {
    isResetting.value = false;
  }, 100);
};

// 重置为默认显示
const resetColumns = () => {
  columnSettings.value.forEach(col => {
    if (!col.fixed) {
      // 重置为默认可见性
      col.visible = col.defaultVisible !== undefined ? col.defaultVisible : true;
    }
  });
  // 提示用户重置成功
  localStorage.removeItem('engineeringTableColumns');
  ElMessage.info('已重置为默认列设置');
};

// 保存设置
const saveSettings = () => {
  emit('save', [...columnSettings.value]);
  // 保存到本地存储，实现持久化
  try {
    localStorage.setItem('engineeringTableColumns', JSON.stringify(columnSettings.value));
    ElMessage.success('保存成功');
  } catch (e) {
    console.warn('无法保存列设置到本地存储');
  }
  emit('close');
};
</script>

<style scoped>
.column-setting {
  width: 360px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.setting-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
}

.close-btn {
  background: none;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #000306;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #1d2129;
}

.setting-body {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
}

.setting-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #4e5969;
}

.column-checkboxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.column-checkbox {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #1d2129;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.column-checkbox:hover {
  background-color: #f5f7fa;
}

.column-checkbox input {
  margin-right: 8px;
}

.fixed-tag {
  margin-left: auto;
  font-size: 12px;
  color: #86909c;
  background-color: #f5f7fa;
  padding: 1px 6px;
  border-radius: 4px;
}

.setting-footer {
  padding: 12px 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-reset {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-reset:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-reset-active {
  border-color: #52c41a !important;
  background-color: #f6ffed !important;
  color: #52c41a !important;
  transition: all 0.1s;
}

.btn-save {
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-save:hover {
  background-color: #096dd9;
} 
 
/* .btn-save {
  display: none;
} /**隐藏按钮*/

</style>
