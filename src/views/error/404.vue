<template>
  <div class="error-container">
    <div class="error-content">
      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik04OS41IDE1QzQ3LjU1NTEgMTUgMTMuNSA0OS4wNTUxIDEzLjUgOTFDMTMuNSAxMzIuOTQ1IDQ3LjU1NTEgMTY3IDg5LjUgMTY3QzEzMS40NDUgMTY3IDE2NS41IDEzMi45NDUgMTY1LjUgOTFDMTY1LjUgNDkuMDU1MSAxMzEuNDQ1IDE1IDg5LjUgMTVaIiBmaWxsPSIjRjJGNUZGIiBzdHJva2U9IiM0MDlFRkYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNjEuODQzOCA4MS43NUg4MC45MDYyTDg1LjQzNzUgNjdIOTMuNTYyNUw5OC4wOTM4IDgxLjc1SDExNy4xNTZWODkuODc1SDEwMC40NjlMMTA0LjQwNiAxMDMuMTI1SDEyMy40Njl2OC4xMjVIMTA2Ljc4MUwxMTEuMzEyIDEyNy41SDEwMy4xODhMOTguNjU2MiAxMTEuMjVINzkuNTkzOEw3NS4wNjI1IDEyNy41SDY2LjkzNzVMNzEuNDY4OCAxMTEuMjVINTIuNDA2MnYtOC4xMjVINzMuODQzOEw3Ny43ODEyIDg5Ljg3NUg1OC43MTg4Vjg0LjM3NUg2MS44NDM4Vjg5Ljg3NVY4MS43NVpNODIuMDMxMiA4OS44NzVMODYuMjgxMiAxMDMuMTI1SDk2LjcxODhMMTAwLjk2OSA4OS44NzVIODIuMDMxMloiIGZpbGw9IiM0MDlFRkYiLz4KPC9zdmc+Cg==" alt="404" class="error-image">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.error-content {
  text-align: center;
  padding: 40px;
}

.error-image {
  width: 180px;
  height: 180px;
  margin-bottom: 24px;
}

h1 {
  font-size: 72px;
  color: #409eff;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 24px;
  color: #303133;
  margin: 24px 0 16px;
}

p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 24px;
}
</style> 