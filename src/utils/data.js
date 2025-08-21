// src/utils/data.js
export const DataUtils = {
  // 日期格式化（如：2024-08-04）
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return format.replace('YYYY', year).replace('MM', month).replace('DD', day);
  },
  
  // 验证手机号
  isPhone(value) {
    return /^1[3-9]\d{9}$/.test(value);
  },
  
  // 深层拷贝对象
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // 根据时间字段从近到远排序数组
  sortByDateDesc(array, dateField) {
    if (!Array.isArray(array) || !dateField) {
      return array;
    }
    // 创建数组副本以避免修改原始数组
    const sortedArray = [...array];

    // 按日期降序排序
    sortedArray.sort((a, b) => {
      const dateA = new Date(a[dateField]);
      const dateB = new Date(b[dateField]);
      return dateB - dateA; // 降序排列
    });
    
    return sortedArray;
  }
};