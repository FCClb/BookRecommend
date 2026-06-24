// api.js — fetch 封装（自动附带 JWT、统一错误处理）

const api = {
  /**
   * 基础请求
   */
  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(CONFIG.API_BASE_URL + path, options);
    const data = await res.json();

    if (!res.ok) {
      // 401 时自动清除过期 token
      if (res.status === 401) {
        localStorage.removeItem('token');
      }
      throw new Error(data.message || '请求失败');
    }

    return data;
  },

  get(path)           { return this.request('GET', path); },
  post(path, body)    { return this.request('POST', path, body); },
  put(path, body)     { return this.request('PUT', path, body); },
  delete(path)        { return this.request('DELETE', path); },
};
