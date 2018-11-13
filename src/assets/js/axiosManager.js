/**
 * Created by mtgr1020 on 2018/8/8.
 */
import axios from 'axios'
import { Message,Loading} from 'element-ui'

const axiosInstance = axios.create();

let loadingInstance;//定时器

//静态请求数据
axiosInstance.defaults.baseURL = "";
axiosInstance.defaults.timeout = 30000;
axiosInstance.defaults.headers.post['content-type'] = 'application/json;charset=utf-8';
axiosInstance.defaults.headers.get['content-type'] = 'application/json;charset=utf-8';

axiosInstance.requestData=function (config) {
  loadingInstance = Loading.service({
    lock: true,
    text: '拼命加载中 ~>_<~',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  //静态请求数据统一处理
  if(!config.tokenId){
    config.headers.token = sessionStorage.getItem("token");
  }
  return config;
};//请求拦截数据处理
axiosInstance.responseData=function (response) {
  loadingInstance.close();
  if(response.data){
    if(response.data.code == 'S'){
      // Message.success(response.data.msg);
    }else if(response.data.code == 'E'){
      Message.error(response.data.msg);
    }
  }
  return response;
};//请求返回拦截数据处理
axiosInstance.error=function (error) {
  loadingInstance.close();
  if (error && error.response) {
    switch (error.response.status) {
      case 400:
        error.message = '错误请求';
        break;
      case 401:
        error.message = '未授权，请重新登录';
        break;
      case 403:
        error.message = '拒绝访问';
        break;
      case 404:
        error.message = '请求错误,未找到该资源';
        break;
      case 405:
        error.message = '请求方法未允许';
        break;
      case 408:
        error.message = '请求超时';
        break;
      case 500:
        error.message = '服务器端出错';
        break;
      case 501:
        error.message = '网络未实现';
        break;
      case 502:
        error.message = '网络错误';
        break;
      case 503:
        error.message = '服务不可用';
        break;
      case 504:
        error.message = '网络超时';
        break;
      case 505:
        error.message = 'http版本不支持该请求';
        break;
      default:
        error.message = `连接错误${err.response.status}`
    }
  } else {
    error.message = "连接到服务器失败"
  }
  Message.error(error.message);
  return error;
};//错误处理

/**
 * 请求拦截器
 */
  axiosInstance.interceptors.request.use(function (config) {
    config = axiosInstance.requestData(config);
    return config;
  });

/**
 * 请求返回拦截器
 */
  axiosInstance.interceptors.response.use(function (response) {
    response = axiosInstance.responseData(response);
    return response.data;
  }, function (error) {
    error = axiosInstance.error(error);
    return Promise.reject(error.message);
  });
export default axiosInstance;
