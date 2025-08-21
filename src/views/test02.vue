<script>
import { useRouter, onMounted } from 'vue-router'; // 导入onMounted
import { storeToRefs } from 'pinia';
import { useUserStore } from '../../stores/userStore';
import { useReportStore } from '../../stores/reportStore';
import { getReportService } from '../../services/reportService';
import { getuserService } from '../../services/userService';

export default {
  name: 'Home',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const reportStore = useReportStore();
    const userService = getuserService();
    const reportService = getReportService(); // 获取服务实例

    // 通过storeToRefs获取响应式的total（关键：在setup内部获取）
    const { total } = storeToRefs(reportStore);
    const { access_token } = storeToRefs(userStore);

    // 在onMounted中调用接口（替代mounted钩子）
    onMounted(async () => {
      console.log('页面初始化，获取报告总数');
      await reportService.handleGetReportsTotal(); // 调用接口更新total
      console.log('setup中获取的total:', total.value); // 此时应正确输出值
    });

    // 导航方法...
    const navigateToReportManagement = () => {
      router.push({ name: 'EngineeringManagement' });
    };
    const navigateToManager = () => {
      router.push({ name: 'Manager' });
    };
    const handleLoginOrLogout = () => {
      if (access_token.value) {
        userService.handleLogout();
      } else {
        router.push({ name: 'Login' });
      }
    };

    // 返回响应式的total和方法（供模板使用）
    return {
      total,
      access_token,
      handleLoginOrLogout,
      navigateToReportManagement,
      navigateToManager
    };
  }
};
</script>