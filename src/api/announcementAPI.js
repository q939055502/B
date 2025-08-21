// 公告相关API
import request from '@/api/index';

/**
 * 获取最新公告
 * @returns {Promise<object>} 公告数据
 */
export const getLatestAnnouncement = () => {
  return request({
    url: '/api/announcement/get-latest',
    method: 'GET'
  });
};

/**
 * 获取所有公告
 * @param {object} params - 查询参数
 * @returns {Promise<Array>} 公告列表
 */
export const getAllAnnouncements = (params = {}) => {
  return request({
    url: '/api/announcement/get-all',
    method: 'GET',
    params
  });
};