/**
 * Excel解析工具
 * @description 提供Excel文件转换为字典数组的功能
 */
import XLSX from 'xlsx-js-style';

/**
 * 报告字段中英文映射
 * @description 从EngineeringManagement.vue中提取的字段映射关系
 */
const reportFieldMap = {
  '报告编号': 'report_code',
  '工程名称': 'project_name',
  '工程地址': 'project_location',
  '工程类型': 'project_type',
  '工程阶段': 'project_stage',
  '建设单位': 'construction_unit',
  '施工单位': 'contractor',
  '监理单位': 'supervisor',
  '见证单位': 'witness_unit',
  '委托单位': 'client_unit',
  '委托人': 'client_contact',
  '备注': 'remarks',
  '受理日期': 'acceptance_date',
  '委托日期': 'commission_date',
  '委托编号': 'commission_code',
  '业务员': 'salesperson',
  '检测单位': 'inspection_unit',
  '资质证书编号': 'certificate_no',
  '联系地址': 'contact_address',
  '联系电话': 'contact_phone',
  '登记人': 'registrant',
  '检测对象': 'inspection_object',
  '检测部位': 'object_part',
  '对象规格': 'object_spec',
  '设计要求': 'design_spec',
  '检验类型': 'inspection_type',
  '检测项目': 'inspection_items',
  '检测项详情': 'test_items',
  '检测数量': 'inspection_quantity',
  '计量单位': 'measurement_unit',
  '检测结果': 'inspection_conclusion',
  '结论描述': 'conclusion_description',
  '是否复检': 'is_recheck',
  '抽样方式': 'sampling_method',
  '抽样日期': 'sampling_date',
  '抽样人员': 'sampler',
  '开始日期': 'start_date',
  '结束日期': 'end_date',
  '检测编号': 'inspection_code',
  '检测员': 'inspector',
  '检测完成日期': 'tester_date',
  '审核人': 'reviewer',
  '审核日期': 'review_date',
  '批准人': 'approver',
  '批准日期': 'approve_date',
  '报告日期': 'report_date',
  '签发日期': 'issue_date',
  '报告状态': 'report_status',
  // '二维码内容': 'qrcode_content',
  '附件路径': 'attachment_paths',
  '创建时间': 'created_at',
  '更新时间': 'updated_at',
};

/**
 * 格式化日期为YYYY-MM-DD格式
 * @param {Date|number} date - 日期对象或Excel日期数字
 * @returns {string} - 格式化后的日期字符串
 */
function formatDate(date) {
  if (!date) return '';

  let dateObj;
  // 处理Excel的日期数字格式（从1900年1月1日开始的天数）
  if (typeof date === 'number') {
    // 转换Excel数字日期到JavaScript日期
    // Excel的基准日期是1899-12-30（实际上Excel将1900年视为闰年，所以需要特殊处理）
    const excelEpoch = new Date(1899, 11, 30);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    // 检查日期数字是否有效（避免极大值导致的日期对象无效）
    if (date > -2147483648 && date < 2147483647) {
      // 处理Excel的1900年闰年错误
      if (date === 60) {
        // 1900-02-29实际上不存在，Excel错误地将其视为有效日期
        dateObj = new Date(1900, 1, 28);
      } else if (date > 60) {
        // 对于60之后的日期，需要减1天以修正Excel的闰年错误
        dateObj = new Date(excelEpoch.getTime() + (date - 1) * millisecondsPerDay);
      } else {
        dateObj = new Date(excelEpoch.getTime() + date * millisecondsPerDay);
      }
    } else {
      return date.toString(); // 无效数字日期，返回原始值的字符串形式
    }
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    // 尝试解析字符串日期
    dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      // 尝试其他常见日期格式解析
      const dateString = String(date);
      // 尝试解析YYYY/MM/DD格式
      const ymdSlashMatch = dateString.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
      if (ymdSlashMatch) {
        const [, year, month, day] = ymdSlashMatch;
        dateObj = new Date(year, month - 1, day);
      } else {
        // 尝试解析MM-DD-YYYY格式
        const mdyDashMatch = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (mdyDashMatch) {
          const [, month, day, year] = mdyDashMatch;
          dateObj = new Date(year, month - 1, day);
        } else {
          // 尝试解析中文日期格式 YYYY年MM月DD日
          // 支持一位数或两位数的月份和日期，例如：2025年8月25日、2025年12月5日
          const chineseDateMatch = dateString.match(/^([0-9]{4})年([0-9]{1,2})月([0-9]{1,2})日$/);
          if (chineseDateMatch) {
            const [, year, month, day] = chineseDateMatch;
            // 确保年月日记为有效数字
            const yearNum = parseInt(year, 10);
            const monthNum = parseInt(month, 10);
            const dayNum = parseInt(day, 10);
            
            // 简单验证日期有效性
            if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
              dateObj = new Date(yearNum, monthNum - 1, dayNum);
            } else {
              return date; // 无效日期，返回原始值
            }
          } else {
            return date; // 如果无法解析为日期，则返回原始值
          }
        }
      }
    }
  }

  // 格式化日期为YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 将Excel文件转换为字典数组
 * @param {File} file - Excel文件对象
 * @param {Object} options - 配置选项
 * @param {boolean} options.useEnglishKeys - 是否使用英文键名
 * @param {string} options.sheetName - 指定工作表名称，默认为第一个工作表
 * @param {boolean} options.formatDates - 是否格式化日期为YYYY-MM-DD格式
 * @returns {Promise<Array>} - 转换后的字典数组
 */
export async function excelToDictArray(file, options = {}) {
  const { useEnglishKeys = true, sheetName = null, formatDates = true, maxRows = 10000 } = options;
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        throw new Error('未提供Excel文件');
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const buffer = e.target.result;

          // 添加超时处理，防止加载大型Excel文件时卡死
          const loadTimeout = 30000; // 30秒超时

          // 监控内存使用
          if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
            const memory = window.performance.memory;
          }

          let workbook;
          try {
            // 记录开始加载时间
            const startTime = Date.now();

            // 使用xlsx-js-style加载buffer
            workbook = XLSX.read(buffer, { type: 'array' });

            const endTime = Date.now();
          } catch (error) {
            console.error('Excel文件加载失败:', error);
            // 判断错误类型
            if (error.message.includes('Unsupported file format')) {
              reject(new Error('不支持的Excel文件格式，请使用.xlsx或.xls格式'));
            } else if (error.message.includes('Corrupted zip')) {
              reject(new Error('Excel文件已损坏或格式不正确'));
            } else {
              reject(new Error(`Excel文件加载失败: ${error.message}`));
            }
            return;
          }

          // 选择工作表
          const worksheet = sheetName
            ? workbook.Sheets[sheetName]
            : workbook.Sheets[workbook.SheetNames[0]];

          if (!worksheet) {
            resolve([]);
            return;
          }

          // 获取表头行
          // xlsx-js-style中，工作表是一个对象，键是单元格地址，值是单元格对象
          // 我们需要找到第一行的所有非空单元格
          const headers = [];
          let columnIndex = 1; // 从A列开始
          while (true) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: columnIndex - 1 }); // 行号从0开始
            const cell = worksheet[cellAddress];
            if (!cell || !cell.v) break; // 如果单元格为空或不存在，则结束循环
            headers.push(cell.v);
            columnIndex++;
          }

          if (headers.length === 0) {
            resolve([]);
            return;
          }

          // 转换数据为JSON
          // 使用xlsx-js-style的内置函数将工作表转换为JSON
          let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: headers, raw: false });

          // 删除表头行（第一个元素）
          jsonData.shift();

          // 限制最大处理行数
          if (jsonData.length > maxRows) {
            jsonData = jsonData.slice(0, maxRows);
          }

          // 处理日期格式化
          if (formatDates) {
            jsonData = jsonData.map(row => {
              const newRow = { ...row };
              Object.keys(newRow).forEach(key => {
                try {
                  // 检查是否为日期字段（既检查当前键名，也检查映射后的英文键名是否包含_date）
                  const isDateField = 
                    key.includes('_date') || 
                    (reportFieldMap[key] && reportFieldMap[key].includes('_date'));
                  
                  if (isDateField) {
                    // 确保日期格式化为YYYY-MM-DD
                    newRow[key] = formatDate(newRow[key]);
                    // 验证格式化结果
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(newRow[key]) && newRow[key] !== '') {
                      console.warn(`日期格式化结果不符合YYYY-MM-DD格式: ${newRow[key]}`);
                    }
                  }
                } catch (dateError) {
                  console.error(`日期格式化失败: ${dateError.message}`);
                  // 格式化失败时保留原始值
                }
              });
              return newRow;
            });
          }

          console.log(`解析完成，共处理 ${jsonData.length} 行数据`);

          // 为 inspection_unit 字段添加默认值
          // 注意：这里的map函数会为每个元素创建新对象，不会中断整个函数
          jsonData = jsonData.map(row => {
            const newRow = { ...row };
            // 注意：在useEnglishKeys=true时，这里处理的是Excel原始表头（中文）
            // 因为英文键名的映射在后面才会进行
            const chineseKey = '检测单位'; // 直接使用中文字段名
            if (!newRow[chineseKey]) {
              newRow[chineseKey] = '广东鸿艺工程质量检测有限公司';
            }
            return newRow;
          });

          // 如果使用英文键名，则进行映射转换
          if (useEnglishKeys) {
            try {
              const result = jsonData.map(row => {
                const newRow = {};
                headers.forEach(header => {
                  const englishKey = reportFieldMap[header] || header;
                  const value = row[header];
                  // 过滤掉undefined值
                  if (value !== undefined) {
                    newRow[englishKey] = value;
                  }
                });
                return newRow;
              });
              resolve(result);
            } catch (mapError) {
              console.error('字段映射错误:', mapError);
              resolve(jsonData); // 映射失败时返回原始数据
            }
          } else {
            // 过滤掉undefined值
            const filteredData = jsonData.map(row => {
              const newRow = {};
              Object.keys(row).forEach(key => {
                const value = row[key];
                if (value !== undefined) {
                  newRow[key] = value;
                }
              });
              return newRow;
            });
            resolve(filteredData);
          }
        } catch (error) {
          console.error('Excel解析错误:', error);
          reject(new Error(`解析Excel失败: ${error.message}`));
        }
      };

      reader.onerror = function() {
        console.error('文件读取错误');
        reject(new Error('读取文件失败'));
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Excel文件处理错误:', error);
      reject(new Error(`处理Excel文件失败: ${error.message}`));
    }
  });
}

/**
 * 将字典数组写入Excel模板文件
 * @param {Array} data - 字典数组
 * @param {Object} options - 配置选项
 * @param {string} options.filename - 文件名
 * @param {File} options.templateFile - Excel模板文件对象
 * @param {string} options.sheetName - 工作表名称
 * @returns {Promise<void>} - 无返回值，直接下载文件
 */
export async function dictArrayToExcel(data, options = {}) {
  const { filename = 'data.xlsx', templateFile, sheetName = 'Sheet1' } = options;

  try {
    if (!data || data.length === 0) {
      throw new Error('没有数据可导出');
    }

    let workbook;
    let worksheet;
    let headers;

    // 创建反向映射（英文->中文）
    const reverseFieldMap = {};
    Object.keys(reportFieldMap).forEach(chineseKey => {
      reverseFieldMap[reportFieldMap[chineseKey]] = chineseKey;
    });

    // 处理数据，转换为中文键
    const processedData = data.map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        const chineseHeader = reverseFieldMap[key] || key;
        newRow[chineseHeader] = row[key];
      });
      return newRow;
    });

    if (templateFile) {
      // 读取模板文件
      const buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(templateFile);
      });

      // 解析模板文件
      workbook = XLSX.read(buffer, { type: 'array' });

      // 选择工作表
      worksheet = sheetName
        ? workbook.Sheets[sheetName]
        : workbook.Sheets[workbook.SheetNames[0]];

      if (!worksheet) {
        throw new Error(`找不到工作表: ${sheetName || workbook.SheetNames[0]}`);
      }

      // 获取表头行（第一行）
      headers = [];
      let columnIndex = 1;
      while (true) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: columnIndex - 1 });
        const cell = worksheet[cellAddress];
        if (!cell || !cell.v) break;
        headers.push(cell.v);
        columnIndex++;
      }

      // 清除除表头外的所有数据行
      // 获取所有单元格地址
      const cellAddresses = Object.keys(worksheet);
      // 过滤出数据行（行号大于0）的单元格
      const dataCellAddresses = cellAddresses.filter(address => {
        const cellRef = XLSX.utils.decode_cell(address);
        return cellRef.r > 0; // 行号从0开始，0是表头行
      });
      // 删除这些单元格
      dataCellAddresses.forEach(address => {
        delete worksheet[address];
      });

      // 准备数据行，确保与表头顺序一致
      const dataRows = processedData.map(row => {
        return headers.map(header => {
          let cellValue = row[header] || '';
          // 处理日期
          if (cellValue instanceof Date) {
            return cellValue.toISOString().split('T')[0]; // 格式化为'yyyy-mm-dd'
          }
          return cellValue;
        });
      });

      // 将数据设置到工作表，从第二行开始（行号1）
      XLSX.utils.sheet_add_aoa(worksheet, dataRows, { origin: 'A2' });
    } else {
      // 如果没有模板文件，使用当前数据的表头
      headers = Object.keys(processedData[0]);

      // 创建工作簿和工作表
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet([]);

      // 准备表头数据
      const headerRow = headers;
      // 准备数据行
      const dataRows = processedData.map(row => {
        return headers.map(header => {
          let cellValue = row[header];
          // 处理日期
          if (cellValue instanceof Date) {
            return cellValue.toISOString().split('T')[0]; // 格式化为'yyyy-mm-dd'
          }
          return cellValue;
        });
      });

      // 组合表头和数据行
      const wsData = [headerRow, ...dataRows];

      // 将数据设置到工作表
      XLSX.utils.sheet_add_aoa(worksheet, wsData, { origin: 'A1' });

      // 设置表头样式（加粗）
      headers.forEach((_, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        worksheet[cellAddress].s = {
          font: { bold: true }
        };
      });

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    // 生成Excel文件缓冲区
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 下载文件
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  } catch (error) {
    throw new Error(`导出Excel失败: ${error.message}`);
  }
}

// 导出工具对象
export const ExcelParser = {
  excelToDictArray,
  dictArrayToExcel
};

export default ExcelParser;

/**
 * 使用说明：
 * 1. 安装依赖：npm install xlsx-js-style --save
 * 2. 导入工具：import { ExcelParser } from '@/utils/excelParser';
 * 3. 使用示例：
 *    // 解析Excel文件
 *    const file = event.target.files[0];
 *    ExcelParser.excelToDictArray(file)
 *      .then(data => console.log('解析结果:', data))
 *      .catch(error => console.error('解析失败:', error));
 *    
 *    // 导出Excel文件
 *    const data = [{ report_code: 'RC001', project_name: '测试工程' }];
 *    ExcelParser.dictArrayToExcel(data, { filename: '测试数据.xlsx' });
 * 
 *    // 另一个导出示例
 *    const data2 = [{ report_code: 'RP001', project_name: '测试工程' }];
 *    ExcelParser.dictArrayToExcel(data2, { filename: '测试报告.xlsx' });
 */