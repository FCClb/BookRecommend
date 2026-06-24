// auth.js — 登录状态管理

const auth = {
  /** 获取 token */
  getToken() {
    return localStorage.getItem('token');
  },

  /** 保存 token */
  setToken(token) {
    localStorage.setItem('token', token);
  },

  /** 清除 token */
  removeToken() {
    localStorage.removeItem('token');
  },

  /** 解析 JWT 获取用户信息 */
  getUser() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      // 检查过期
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        this.removeToken();
        return null;
      }
      return { id: decoded.id, username: decoded.username, role: decoded.role };
    } catch (_) {
      return null;
    }
  },

  /** 是否已登录 */
  isLoggedIn() {
    return !!this.getUser();
  },

  /** 是否为管理员 */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  /** 登出 */
  logout() {
    this.removeToken();
    window.location.href = 'index.html';
  },
};
