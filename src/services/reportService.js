// 导入必要的依赖
import { reportService as apiReportService } from '../api/reportAPI';
import { HTTP_200_OK } from '../utils/status_codes.js';
import { useReportStore } from '../stores/reportStore';
import { ElMessage } from 'element-plus';

// 报告服务类
class ReportService {
  constructor() {
    // 获取store实例
    this.store = useReportStore();
  }

  // 获取报告列表
  async handleGetReportsList(options = {}) {
    try {
      this.store.loading = true;
      this.store.error = null;

      const page = options.page || this.store.currentPage;
      const per_page = options.per_page || this.store.pageSize;
      // 参数处理：统一使用search_keyword
      const search_keyword = options.keyword || options.searchKeyword || this.store.searchKeyword;

      // 调用API服务
      const res = await apiReportService.getReportList({
        page,
        per_page,
        search_keyword
      });

      if (res.data.code === HTTP_200_OK) {
        // 直接更新store状态
        this.store.tableData = res.data.data?.reports || [];
        this.store.total = res.data.data?.pagination?.total_items || res.data.data?.reports?.length || 0;
        this.store.currentPage = res.data.data?.pagination?.page || 1;
        this.store.pageSize = res.data.data?.pagination?.per_page || res.data.data?.reports?.length || 10;
        this.store.searchKeyword = search_keyword;

        return {
          success: true,
          data: res.data.data
        };
      } else {
        this.store.error = res.data || '获取报告列表失败';
        return {
          success: false,
          error: this.store.error
        };
      }
    } catch (err) {
      console.error('获取报告列表失败', err);
      this.store.error = err.message || '获取报告列表失败';
      return {
        success: false,
        error: this.store.error
      };
    } finally {
      this.store.loading = false;
    }
  }

  // 全量获取报告列表
  async handleGetAllReportsList(options = {}) {
    try {
      this.store.loading = true;
      this.store.error = null;

      // 参数处理：如果有额外参数需要处理，可以在这里添加
      const params = { ...options };

      const res = await apiReportService.apiGetAllReportsList(params);

      if (res.code === HTTP_200_OK) {
        // 直接更新store状态
        this.store.tableData = res.data?.reports || [];
        this.store.total = res.data?.pagination?.total_items || res.data?.reports?.length || 0;
        this.store.currentPage = 1;
        this.store.pageSize = res.data?.pagination?.per_page || 10;

        return {
          success: true,
          data: res.data
        };
      } else {
        this.store.error = res.data || '获取全量报告列表失败';
        return {
          success: false,
          error: this.store.error
        };
      }
    } catch (err) {
      console.error('获取全量报告列表失败', err);
      this.store.error = err.message || '获取全量报告列表失败';
      return {
        success: false,
        error: this.store.error
      };
    } finally {
      this.store.loading = false;
    }
  }

  // 获取报告总数
  async handleGetReportsTotal() {
    try {
      this.store.loading = true;
      this.store.error = null;

      const res = await apiReportService.getReportsCount();
      
      if (res.data?.code === HTTP_200_OK) {
        // 直接更新store状态
        console.log('AAAAAAAAAAAAAAAAA获取报告总数成功',res.data?.data.total_count)//正确输出
        this.store.total = res.data?.data.total_count || 0;
        return {
          success: true,
          total: this.store.total
        };
        

      } else {
        this.store.error = res.data || '获取报告总数失败';
        return {
          success: false,
          total: 0
        };
      }
    } catch (err) {
      console.error('获取报告总数失败', err);
      this.store.error = err.message || '获取报告总数失败';
      return {
        success: false,
        total: 0
      };
    } finally {
      this.store.loading = false;
    }
  }

  // 新增报告
  async handleAddNewReport(reportData) {
    try {
      this.store.loading = true;
      this.store.error = null;
      // 参数校验和处理
      if (!reportData || typeof reportData !== 'object') {
        throw new Error('报告数据必须是有效的对象');
      }

      // 可以在这里添加更多的参数校验逻辑
      const validatedData = { ...reportData };

      const res = await apiReportService.addReport(validatedData);
      console.log(res)
      console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++新增报告');
      if (res.code === HTTP_200_OK) {
        console.log('新增报告成功', res.report);
        // 新增成功后刷新列表
        await this.handleGetReportsList();
        return {
          success: true,
          report: res.report
        };
      } else {
        this.store.error = res.data || '新增报告失败';
        return {
          success: false,
          error: this.store.error
        };
      }
    } catch (err) {
      console.error('新增报告失败', err);
      this.store.error = err.message || '新增报告失败';
      return {
        success: false,
        error: this.store.error
      };
    } finally {
      this.store.loading = false;
    }
  }

  // 修改报告
  async handleUpdateExistingReport(reportCode, reportData) {
    try {
      this.store.loading = true;
      this.store.error = null;
      // 参数校验
      if (!reportCode) {
        throw new Error('报告编号不能为空');
      }
      if (!reportData || typeof reportData !== 'object') {
        throw new Error('报告数据必须是有效的对象');
      }

      // 参数处理
      const validatedData = { ...reportData };

      const res = await apiReportService.updateReport(reportCode, validatedData);
      if (res.data.code === HTTP_200_OK) {
        // 修改成功后刷新列表
        await this.handleGetReportsList();
        return {
          success: true,
          data: res.data
        };
      } else {
        this.store.error = res.data || '修改报告失败';
        return {
          success: false,
          error: this.store.error
        };
      }
    } catch (err) {
      console.error('修改报告失败', err);
      this.store.error = err.response.data.message || '修改报告失败';
      return {
        success: false,
        error: this.store.error
      };
    } finally {
      this.store.loading = false;
    }
  }

  // 删除报告
  async handleDeleteExistingReport(reportCode) {
    try {
      this.store.loading = true;
      this.store.error = null;

      // 参数校验
      if (!reportCode) {
        throw new Error('报告编号不能为空');
      }

      const res = await apiReportService.deleteReport(reportCode);
      console.log('============================删除报告接口返回', res);
      if (res.code === HTTP_200_OK) {
        console.log('删除报告成功', res.data);
        // 删除成功后刷新列表
        await this.handleGetReportsList();
        return {
          success: true,
          data: res.data
        };
      } else {
        this.store.error = res.data || '删除报告失败';
        return {
          success: false,
          error: this.store.error
        };
      }
    } catch (err) {
      console.error('删除报告失败', err);
      this.store.error = err.message || '删除报告失败';
      return {
        success: false,
        error: this.store.error
      };
    } finally {
      this.store.loading = false;
    }
  }

  // 批量删除报告
  async handleBatchDeleteExistingReports(reportCodes) {
    try {
      this.store.loading = true;
      this.store.error = null;

      // 参数校验
      if (!Array.isArray(reportCodes) || reportCodes.length === 0) {
        throw new Error('报告编号数组不能为空');
      }

      // 参数处理：确保所有元素都是字符串类型的报告编号
      const validatedCodes = reportCodes.filter(code => typeof code === 'string' && code.trim());
      if (validatedCodes.length === 0) {
        throw new Error('没有有效的报告编号');
      }

      const res = await apiReportService.batchDeleteReports(validatedCodes);

      if (res.code === HTTP_200_OK) {
        console.log('批量删除报告成功', res.data);
        // 删除成功后刷新列表
        await this.handleGetReportsList();
        return {
          success: true,
          data: res.data
        };
      } else {
        this.store.error = res.data || '批量删除报告失败';
        return {
          success: false,
          error: this.store.error
        };
      }
    } catch (err) {
      console.error('批量删除报告失败', err);
      this.store.error = err.message || '批量删除报告失败';
      return {
        success: false,
        error: this.store.error
      };
    } finally {
      this.store.loading = false;
    }
  }

  // 根据报告编号查询报告
  async handleGetReportByCode(reportCode) {
    try {
      this.store.loading = true;
      this.store.error = null;

      // 参数校验
      if (!reportCode) {
        throw new Error('报告编号不能为空');
      }

      const res = await apiReportService.getReportDetail(reportCode);

      if (res.data.code === HTTP_200_OK) {
        console.log('报告详情获取成功', res.data);
        return {
          success: true,
          data: res.data.data
        };
      } else {
        this.store.error = res.data.data || '查询不到该报告';
        return {
          success: false,
          error: this.store.error
        };
      }
    } catch (err) {
      console.error('根据报告编号查询报告失败', err);
      this.store.error = err.message || '报告详情获取失败';
      return {
        success: false,
        error: this.store.error
      };
    } finally {
      this.store.loading = false;
    }
  }
}

// 创建并导出单例实例
let reportService = null;

export function getReportService() {
  if (!reportService) {
    reportService = new ReportService();
  }
  return reportService;
}

export default reportService;