// import axios from "axios";
import fetchJsonp from "fetch-jsonp";

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (server, type, id) => {
  const res = await fetch(
    `${import.meta.env.VITE_SONG_API}?server=${server}&type=${type}&id=${id}`,
  );
  const data = await res.json();

  if (data[0].url.startsWith("@")) {
    // eslint-disable-next-line no-unused-vars
    const [handle, jsonpCallback, jsonpCallbackFunction, url] = data[0].url.split("@").slice(1);
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const domain = (
      jsonpData.req_0.data.sip.find((i) => !i.startsWith("http://ws")) ||
      jsonpData.req_0.data.sip[0]
    ).replace("http://", "https://");

    return data.map((v, i) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: domain + jsonpData.req_0.data.midurlinfo[i].purl,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  } else {
    return data.map((v) => ({
      name: v.name || v.title,
      artist: v.artist || v.author,
      url: v.url,
      cover: v.cover || v.pic,
      lrc: v.lrc,
    }));
  }
};

/**
 * 一言
 */

// 获取一言数据
export const getHitokoto = async () => {
  const res = await fetch("https://v1.hitokoto.cn");
  return await res.json();
};

/**
 * 天气
 */
// 添加错误处理和重试机制的完整方案
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

/**
 * 带错误处理和重试的fetch请求
 */
const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors', // 确保CORS
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`请求失败，${RETRY_DELAY}ms后重试... (剩余重试次数: ${retries})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw new Error(`请求失败: ${error.message}`);
  }
};

/**
 * 获取高德地理位置信息
 */
export const getAdcode = async (key) => {
  try {
    return await fetchWithRetry(`https://restapi.amap.com/v3/ip?key=${key}`);
  } catch (error) {
    console.error('获取地理位置失败:', error);
    // 返回默认位置（如北京）作为fallback
    return {
      status: '1',
      province: '北京市',
      city: '北京市',
      adcode: '110000'
    };
  }
};

/**
 * 获取高德天气信息
 */
export const getWeather = async (key, city) => {
  try {
    return await fetchWithRetry(
      `https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`
    );
  } catch (error) {
    console.error('获取天气信息失败:', error);
    // 返回模拟数据作为fallback
    return {
      status: '1',
      count: '1',
      info: 'OK',
      lives: [{
        province: '北京市',
        city: '北京市',
        weather: '晴',
        temperature: '25',
        winddirection: '南风',
        windpower: '≤3级',
        humidity: '40'
      }]
    };
  }
};

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = async () => {
  const res = await fetch("https://api.oioweb.cn/api/weather/GetWeather");
  return await res.json();
};
