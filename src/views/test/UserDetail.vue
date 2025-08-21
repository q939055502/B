<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- 顶部基本信息 -->
    <div class="p-6 border-b">
      <div class="flex flex-col md:flex-row items-start md:items-center">
        <div class="w-24 h-24 bg-gray-200 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 flex-shrink-0">
          <img
            v-if="user.avatar"
            :src="user.avatar"
            alt="用户头像"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <span class="text-xl font-bold">{{ user.username?.charAt(0) || '?' }}</span>
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ user.username || '未设置' }}</h1>
          <p class="text-gray-600 mb-2">{{ user.position_name || '未设置岗位' }} | {{ user.department_id || '未设置部门' }}</p>
          <div class="flex flex-wrap gap-2">
            <span :class="statusClass">{{ statusText }}</span>
            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{{ user.employment_type || '未设置' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情内容 -->
    <div class="p-6">
      <!-- 联系方式 -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">联系方式</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center">
            <span class="text-gray-500 w-24">邮箱:</span>
            <span class="text-gray-900">{{ user.email || '-' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-24">电话:</span>
            <span class="text-gray-900">{{ user.phone_number || '-' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-24">昵称:</span>
            <span class="text-gray-900">{{ user.nickname || '-' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-24">地址:</span>
            <span class="text-gray-900">{{ user.address || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 个人信息 -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">个人信息</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center">
            <span class="text-gray-500 w-24">性别:</span>
            <span class="text-gray-900">{{ genderText }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-24">生日:</span>
            <span class="text-gray-900">{{ user.birthday || '-' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-24">入职日期:</span>
            <span class="text-gray-900">{{ user.hire_date || '-' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-24">身份证号:</span>
            <span class="text-gray-900">{{ formatIdCard(user.id_card_number) }}</span>
          </div>
          <div class="md:col-span-2 flex items-start">
            <span class="text-gray-500 w-24 mt-1">简介:</span>
            <span class="text-gray-900">{{ user.bio || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 账号信息 -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">账号信息</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center">
            <span class="text-gray-500 w-32">用户ID:</span>
            <span class="text-gray-900">{{ user.id || '-' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-32">创建时间:</span>
            <span class="text-gray-900">{{ formatDateTime(user.created_at) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-32">更新时间:</span>
            <span class="text-gray-900">{{ formatDateTime(user.updated_at) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-32">最后登录:</span>
            <span class="text-gray-900">{{ formatDateTime(user.last_login_at) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-gray-500 w-32">最后注销:</span>
            <span class="text-gray-900">{{ formatDateTime(user.last_logout_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 扩展信息 -->
      <div v-if="user.ext_info">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">扩展信息</h2>
        <div class="bg-gray-50 p-4 rounded-md">
          <pre class="text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(user.ext_info, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserDetail',
  props: {
    user: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  computed: {
    statusText() {
      return this.user.status === 'active' ? '正常' : 
             this.user.status === 'inactive' ? '禁用' : 
             this.user.status === 'pending' ? '待审核' : 
             this.user.status || '-';
    },
    statusClass() {
      return this.user.status === 'active' ? 
             'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full' : 
             this.user.status === 'inactive' ? 
             'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full' : 
             this.user.status === 'pending' ? 
             'px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full' : 
             'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full';
    },
    genderText() {
      return this.user.gender === 'male' ? '男' : 
             this.user.gender === 'female' ? '女' : 
             this.user.gender || '-';
    }
  },
  methods: {
    formatDateTime(dateTime) {
      if (!dateTime) return '-';
      // 简化的日期时间格式化，实际项目中可使用dayjs等库
      const date = new Date(dateTime);
      return date.toLocaleString();
    },
    formatIdCard(idCard) {
      if (!idCard) return '-';
      // 身份证号脱敏处理
      return idCard.replace(/(\d{6})\d{8}(\w{4})/, '$1********$2');
    }
  }
};
</script>

<style scoped>
/* 可根据需要添加额外样式 */
</style>