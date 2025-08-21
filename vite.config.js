// vite.config.js
// 项目的Vite配置文件，用于配置开发服务器、构建选项、插件等
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { VantResolver } from '@vant/auto-import-resolver';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
// 导入Tailwind CSS的PostCSS插件和autoprefixer
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd());
  const isProduction = mode === 'production';
  const urlHeader = env.VITE_API_URL || '';
  const urlHeader_proxy = env.VITE_PROXY_TARGET || '';

  return {
    // 配置Vite插件
    plugins: [
      // Vue插件，用于处理.vue文件
      vue(),
      // 自动导入组件
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: false }), VantResolver()],
        dts: 'src/types/auto-imports.d.ts' // 保留，生成类型文件,// 自动导入 API（如 ElMessage）
      }),
      // 自动注册组件
      Components({
        resolvers: [ElementPlusResolver({ importStyle: false }), VantResolver()],
        dts: 'src/types/auto-imports.d.ts' // 保留，生成类型文件 自动导入组件（如 el-checkbox）
      })
    ],
    
    // CSS配置
      css: {
        postcss: {
          plugins: [
            tailwindcss(),
            autoprefixer()
          ]
        }
      },
    
    // 路径解析配置
    resolve: {
      alias: {
        // 设置@为src目录的别名
        '@': path.resolve(__dirname, 'src')
      }
    },
    
    // 构建配置
    build: {
      // 开发环境生成sourcemap，生产环境不生成
      sourcemap: !isProduction,
      // 生产环境开启代码压缩
      minify: isProduction
    },
    
    // 开发服务器配置（仅开发环境有效）
    server: isProduction ? undefined : {
      // 自动打开浏览器
      open: true,
      // 允许外部访问
      host: '0.0.0.0',
      
      // 自定义中间件
      middleware: [
        // 全局请求日志中间件
        (req, res, next) => {
          if (!isProduction) {
            // 只记录非代理请求的URL
            if (!req.url.startsWith('/api')) {
              console.log('Request URL:', req.url);
            }
          }
          next();
        }
      ],
      
      // 代理配置
      proxy: {
        '/api': {
          // 代理目标地址
          target: urlHeader_proxy,
          // 改变请求源
          changeOrigin: true,
          // 重写URL路径
          rewrite: (path) => {
            // 去掉 '/api' 前缀
            const newPath = path.replace('/api', '');
            
            if (!isProduction) {
              console.log(`重写URL: ${path} → ${newPath}`);
            }
            return newPath;
          },
          // 自定义代理配置
          configure: (proxy, options) => {
            // 打印当前代理配置
            // console.log('前端代理路径:', '/api');
            // console.log('前端API基础URL:', urlHeader);
            // console.log('后端目标URL:', urlHeader_proxy);
            
            if (!isProduction) {
              // 监听代理请求事件
              proxy.on('proxyReq', (proxyReq, req) => {
                console.log(`代理请求: ${req.method} ${req.url} → ${options.target}${proxyReq.path}`);
              });
              
              // 监听代理错误
              proxy.on('error', (err, req, res) => {
                console.error('代理错误:', err);
                res.writeHead(500, {
                  'Content-Type': 'text/plain'
                });
                res.end('代理服务错误');
              });
            }
          }
        }
      }
    }
  };
});