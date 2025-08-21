<template>
  <div 
    class="flowing-bar"
    :class="{ 'visible': isVisible }"
    :style="{
      backgroundColor: bgColor,
      color: textColor,
      height: height
    }"
  >
    <!-- 流动容器 -->
    <div class="flow-container" ref="container">
      <div class="flow-content" ref="content">
        <slot>
          这是一条从右侧缓慢进入的通知，会保持匀速向左流动 - 可自定义修改内容
        </slot>
        <!-- 复制内容用于无缝衔接 -->
        <span class="content-spacer">  </span>
        <slot>
          这是一条从右侧缓慢进入的通知，会保持匀速向左流动 - 可自定义修改内容
        </slot>
      </div>
    </div>
    
    <!-- 关闭按钮 -->
    <button 
      class="close-btn" 
      @click="isVisible = false"
      aria-label="关闭通知"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

// 组件属性
const props = defineProps({
  // 显示状态
  visible: {
    type: Boolean,
    default: true
  },
  // 滚动速度(数值越小越慢，建议10-50)
  speed: {
    type: Number,
    default: 100
  },
  // 背景颜色
  bgColor: {
    type: String,
    default: 'transparent'
  },
  // 文本颜色
  textColor: {
    type: String,
    default: '#b1e15d'
  },
  // 组件高度
  height: {
    type: String,
    default: '32px'
  }
});

// 状态管理
const isVisible = ref(props.visible);
const container = ref(null);
const content = ref(null);
const animationFrame = ref(null);
const position = ref(0);

// 同步外部visible属性变化
watch(
  () => props.visible,
  (newVal) => {
    isVisible.value = newVal;
  }
);

// 初始化位置：内容完全在右侧外部
const initPosition = () => {
  if (container.value && content.value) {
    const containerWidth = container.value.offsetWidth;
    // 初始位置：内容左侧与容器右侧对齐（完全在右侧外部）
    position.value = containerWidth;
    applyPosition();
  }
};

// 应用位置变换
const applyPosition = () => {
  if (content.value) {
    content.value.style.transform = `translateX(${position.value}px)`;
  }
};

// 匀速滚动动画
const animate = () => {
  if (!container.value || !content.value || !isVisible.value) return;
  
  const containerWidth = container.value.offsetWidth;
  const contentWidth = content.value.offsetWidth / 2; // 内容复制了一份，取一半
  
  // 持续向左移动（速度恒定）
  position.value -= props.speed / 100;
  
  // 当内容完全滚动出左侧后，重置位置从右侧重新开始
  if (position.value < -contentWidth) {
    position.value = containerWidth;
  }
  
  applyPosition();
  animationFrame.value = requestAnimationFrame(animate);
};

// 开始动画
const startAnimation = () => {
  if (animationFrame.value) cancelAnimationFrame(animationFrame.value);
  
  nextTick(() => {
    initPosition();
    // 直接开始匀速滚动，没有突兀的加速或减速
    animate();
  });
};

// 停止动画
const stopAnimation = () => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }
};

// 监听显示状态变化
watch(isVisible, (newVal) => {
  if (newVal) {
    setTimeout(startAnimation, 100); // 确保DOM已渲染
  } else {
    stopAnimation();
  }
});

// 窗口大小变化时重新计算
const handleResize = () => {
  if (isVisible.value) {
    stopAnimation();
    startAnimation();
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  if (isVisible.value) {
    startAnimation();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  stopAnimation();
});
</script>

<style scoped>
.flowing-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 9999;
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 显示状态 */
.flowing-bar.visible {
  transform: translateY(0);
}

/* 流动容器 */
.flow-container {
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
  margin: 0 40px; /* 左右留出空间，避免被关闭按钮遮挡 */
}

/* 流动内容 */
.flow-content {
  display: inline-flex;
  align-items: center;
  height: 100%;
  white-space: nowrap;
  position: absolute;
  will-change: transform;
}

/* 内容之间的间隔 */
.content-spacer {
  display: inline-block;
  width: 100px; /* 两段内容之间的距离 */
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: currentColor;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  padding: 0;
  opacity: 0.8;
  z-index: 10;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 1;
}
</style>
