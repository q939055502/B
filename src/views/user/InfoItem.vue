<template>
  <div class="info-item">
    <div class="info-label">{{ label }}:</div>
    <div class="info-value">
      <slot>
        {{ value || '无' }}
      </slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number, Boolean, Date, null, undefined],
    default: null
  }
});
</script>

<style scoped>
.info-item {
  display: flex;
  padding: 0.8rem 0;
  border-bottom: 1px dashed #e9ecef;
  transition: background-color 0.2s;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

.info-label {
  flex: 0 0 120px;
  font-weight: 500;
  color: #6c757d;
}

.info-value {
  flex: 1;
  color: #2d3436;
  word-break: break-word;
}

.contact-link {
  margin-left: 0.5rem;
  color: #007bff;
  transition: color 0.2s;
}

.contact-link:hover {
  color: #0056b3;
}
</style>
