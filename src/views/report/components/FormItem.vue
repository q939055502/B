<template>
  <div class="form-item" :class="{ 'required': required, 'disabled': disabled }" :data-span="span">
    <label class="form-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    <div class="form-control">
      <slot></slot> <!-- 插槽用于放置输入控件 -->
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  span: {
    type: Number,
    default: 1
  }
});
</script>

<style scoped>
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  color: #4e5969;
  display: flex;
  align-items: center;
}

.required-mark {
  color: #ff4d4f;
  margin-left: 4px;
}

.form-control {
  width: 100%;
}

.disabled .form-control {
  opacity: 0.6;
  pointer-events: none;
}
</style>
