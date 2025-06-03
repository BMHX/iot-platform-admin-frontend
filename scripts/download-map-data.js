import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建目录
const mapDir = path.join(__dirname, '../src/assets/map');
if (!fs.existsSync(mapDir)) {
  fs.mkdirSync(mapDir, { recursive: true });
}

// 下载中国地图数据
async function downloadChinaMap() {
  try {
    console.log('开始下载中国地图数据...');
    const response = await axios.get('https://raw.githubusercontent.com/zhangyu9609/echarts-mapJson/master/china.json');
    
    // 保存到文件
    const filePath = path.join(mapDir, 'china.json');
    fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
    
    console.log(`中国地图数据已保存到: ${filePath}`);
    return true;
  } catch (error) {
    console.error('下载中国地图数据失败:', error.message);
    return false;
  }
}

// 执行下载
downloadChinaMap(); 