
/**
 * 报告相关API服务
 * @description 封装报告的创建、查询、更新和删除等接口
 */
import request from './index';

/**
 * 报告服务对象
 * @description 包含所有报告相关的API方法
 */
export const reportService = {
  /**
   * 获取报告列表（支持分页）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.per_page - 每页条数
   * @param {string} params.search_keyword - 搜索关键词
   * @returns {Promise<Object>} - 报告列表数据
   */
getReportList: (params) => {
    return request.get('/api/report/get-reports', {
      params
    });
  },

//   /**
//    * 获取所有报告列表
//    * @param {Object} [params={}] - 查询参数
//    * @returns {Promise<Object>} - 所有报告数据
//    */
// apiGetAllReportsList: (params = {}) => {
//     return request.get('/api/report/get-all-reports', {
//       params
//     });
//   },

  /**
   * 获取报告总数
   * @returns {Promise<Object>} - 报告总数数据
   */
getReportsCount: () => {
    return request.get('/api/report/get-total-active-reports');
  },

  /**
   * 新增报告
   * @param {Object} reportData - 报告数据
   * @returns {Promise<Object>} - 新增结果
   */
addReport: (reportData) => {
    return request.post('/api/report/add-report', reportData);
  },

  /**
   * 更新报告（根据报告编号）
   * @param {string} reportCode - 报告编号
   * @param {Object} reportData - 报告数据
   * @returns {Promise<Object>} - 更新结果
   */
updateReport: (reportCode, reportData) => {
    return request.put(`/api/report/update-report/${reportCode}`, reportData);
  },

  /**
   * 删除报告（根据报告编号）
   * @param {string} reportCode - 报告编号
   * @returns {Promise<Object>} - 删除结果
   */
deleteReport: (reportCode) => {
    return request.delete(`/api/report/delete-report/${reportCode}`);
  },

  /**
   * 获取报告详情（根据报告编号）
   * @param {string} reportCode - 报告编号
   * @returns {Promise<Object>} - 报告详情数据
   */
getReportDetail: (reportCode) => {
    return request.get(`/api/report/get-report-by-code?report_code=${reportCode}`);
  },

  /**
   * 批量删除报告
   * @param {Array<string>} reportCodes - 报告编号数组
   * @returns {Promise<Object>} - 批量删除结果
   */
batchDeleteReports: (reportCodes) => {
    return request.delete('/api/report/batch-delete-reports', {
      data: { report_codes: reportCodes }
    });
  },

  /**
   * 批量新增报告
   * @param {Array<Object>} reportsData - 报告数据数组
   * @returns {Promise<Object>} - 批量新增结果
   */
batchAddReports: (reportsData) => {
    return request.post('/api/report/batch-add-reports', reportsData);
  },

  /**
   * 批量更新报告
   * @param {Array<Object>} reportsData - 包含报告编号和更新数据的对象数组
   * @returns {Promise<Object>} - 批量更新结果
   */
batchUpdateReports: (reportsData) => {
    return request.put('/api/report/batch-update-reports', reportsData);
  },

  /**
   * 根据报告编号数组获取报告数据
   * @param {Array<string>} reportCodes - 报告编号数组
   * @returns {Promise<Object>} - 报告数据
   */
getReportsByCodes: (reportCodes) => {
    return request.post('/api/report/get-reports-by-codes', {
      report_codes: reportCodes
    });
  }
};



