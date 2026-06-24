/**
 * 统一 JSON 响应格式
 * 所有接口均返回 { code, message, data }
 */

function success(res, data = null, message = 'ok', statusCode = 200) {
  return res.status(statusCode).json({ code: statusCode, message, data });
}

function created(res, data = null, message = '创建成功') {
  return success(res, data, message, 201);
}

function fail(res, message = '请求失败', statusCode = 400) {
  return res.status(statusCode).json({ code: statusCode, message });
}

module.exports = { success, created, fail };
