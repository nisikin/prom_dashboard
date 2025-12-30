import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from 'axios';
import { API_URL } from "./config";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Query metrics for a single point in time
// return data in the format of { time: timestamp, instance1: value1, instance2: value2, ... }
export async function queryMetrics(path) {
  try {
    const res = await axios.get(`${API_URL}${path}`);
    if (res.data.length <= 0) {
      return {};
    }
    var line = {};
    line["time"] = res.data[0].values[0].timestamp;
    for (var i = 0; i < res.data.length; i++) {
      var metric = res.data[i];
      line[metric.instance] = parseFloat(metric.values[0].value).toFixed(2);
    }
    return line;
  } catch (error) {
    console.error("Error querying metrics:", error);
    return {};
  }
}

// Query metrics for a range of time
// return data in the format of 
// [
// { time: timestamp, instance1: value1, instance2: value2, ... },
// { time: timestamp, instance1: value1, instance2: value2, ... },
// ...
// ]
export async function queryMetricsRange(path, start, end, step = "5s") {
  try {
    const res = await axios.get(`${API_URL}${path}?start=${start}&end=${end}&step=${step}`);
    if (res.data.length <= 0) {
      return [];
    }
    var data = [];
    for (var i = 0; i < res.data[0].values.length; i++) {
      var line = {};
      line["time"] = res.data[0].values[i].timestamp;
      for (var j = 0; j < res.data.length; j++) {
        var metric = res.data[j];
        line[metric.instance] = parseFloat(metric.values[i].value).toFixed(2);
      }
      data.push(line);
    }
    return data;
  } catch (error) {
    console.error("Error querying metrics:", error);
    return [];
  }
}

// line is in the format of { time: timestamp, instance1: value1, instance2: value2, ... }
export function createChartConfig(line) {
  var config = {};
  const stringHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  for (var key in line) {
    if (key === "time") {
      continue;
    }
    const hash = stringHash(key);
    const color = "#" + (hash % 16777215).toString(16).padStart(6, "0");
    var series = { label: key, color: color };
    config[key] = series;
  }
  return config;
}

export async function generatePromQL(userPrompt) {
  axios.get(`${API_URL}/llm/get_promql?prompt=${encodeURIComponent(userPrompt)}`).then((res) => {
    console.log(res);
    return res.data;
  });
}