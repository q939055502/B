// utils/tabCommunication.js（简化版）
class TabCommunication {
  // 初始化：只监听登录状态相关的消息
  static init() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'login-state-sync') { // 仅处理登录状态的 key
        const message = JSON.parse(event.newValue);
        this.handleLoginStateMessage(message); // 直接调用登录状态处理方法
      }
    });
  }

  // 仅处理登录状态消息（替代通用 handleMessage）
  static handleLoginStateMessage(message) {
    // 触发自定义事件，携带登录状态数据
    document.dispatchEvent(
      new CustomEvent('login-state-changed', { detail: message })
    );
  }

  // 仅发送登录状态消息（替代通用 sendMessage）
  static sendLoginState(state) {
    // 消息格式固定为登录状态相关字段
    const message = {
      token: state.access_token,
      isLogin: state.isLogin,
      userInfo: state.userInfo
    };
    localStorage.setItem('login-state-sync', JSON.stringify(message));
    setTimeout(() => localStorage.removeItem('login-state-sync'), 0);
  }
}

export default TabCommunication;