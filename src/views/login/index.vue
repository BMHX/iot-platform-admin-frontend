<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>物联网运营平台</h2>
        <p>登录系统以管理您的IoT设备</p>
      </div>
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        class="login-form"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-link type="primary" class="forgot-password" href="#">忘记密码?</el-link>
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item label="选择测试账号">
          <el-radio-group v-model="selectedRole" @change="handleRoleChange">
            <el-radio label="admin">管理员</el-radio>
            <el-radio label="operator">运营人员</el-radio>
            <el-radio label="tenant">租户</el-radio>
            <el-radio label="user">普通用户</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >登录</el-button>
        </el-form-item>
      </el-form>

      <!-- 测试账号提示 -->
      <div class="test-account-tips">
        <h3>测试账号</h3>
        <el-divider />
        <ul>
          <li>
            <strong>管理员：</strong> 用户名 admin，密码 123456
          </li>
          <li>
            <strong>普通用户：</strong> 用户名 user，密码 123456
          </li>
          <li>
            <strong>租户账号：</strong> 用户名 tenant，密码 123456
          </li>
          <li>
            <strong>运营人员：</strong> 用户名 operator，密码 123456
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../stores/user'
import { login } from '../../api/auth'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

// 登录表单
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  remember: false
})

// 选择的角色
const selectedRole = ref('admin')

// 角色变更
const handleRoleChange = (role) => {
  loginForm.username = role
  loginForm.password = '123456'
}

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
}

// 登录方法
const handleLogin = () => {
  if (!loginFormRef.value) return
  
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 真实环境下，应该调用API登录
      // 在未完成实际API对接前，保留模拟登录逻辑
      try {
        // 如果后端接口已就绪，使用以下代码
        // login({
        //   username: loginForm.username,
        //   password: loginForm.password
        // }).then(res => {
        //   if (res.code === 0 || res.code === 200) {
        //     // 登录成功
        //     userStore.setToken(res.data.token)
        //     userStore.setUserInfo(res.data.userInfo)
        //     ElMessage.success('登录成功')
        //     router.push('/')
        //   } else {
        //     ElMessage.error(res.message || '登录失败')
        //   }
        //   loading.value = false
        // }).catch(err => {
        //   ElMessage.error(err.message || '登录失败')
        //   loading.value = false
        // })
        
        // 模拟登录请求
        setTimeout(() => {
          // 管理员账号
          if (loginForm.username === 'admin' && loginForm.password === '123456') {
            // 登录成功
            const token = 'mock_token_admin_' + Date.now()
            userStore.setToken(token)
            
            // 设置用户信息
            userStore.setUserInfo({
              username: loginForm.username,
              avatar: '',
              role: 'admin'
            })
            
            ElMessage.success('管理员登录成功')
            router.push('/')
          } 
          // 普通用户账号
          else if (loginForm.username === 'user' && loginForm.password === '123456') {
            // 登录成功
            const token = 'mock_token_user_' + Date.now()
            userStore.setToken(token)
            
            // 设置用户信息
            userStore.setUserInfo({
              username: loginForm.username,
              avatar: '',
              role: 'user'
            })
            
            ElMessage.success('普通用户登录成功')
            router.push('/')
          }
          // 租户账号
          else if (loginForm.username === 'tenant' && loginForm.password === '123456') {
            // 登录成功
            const token = 'mock_token_tenant_' + Date.now()
            userStore.setToken(token)
            
            // 设置用户信息
            userStore.setUserInfo({
              username: loginForm.username,
              avatar: '',
              role: 'tenant'
            })
            
            ElMessage.success('租户登录成功')
            router.push('/')
          }
          // 运营人员账号
          else if (loginForm.username === 'operator' && loginForm.password === '123456') {
            // 登录成功
            const token = 'mock_token_operator_' + Date.now()
            userStore.setToken(token)
            
            // 设置用户信息
            userStore.setUserInfo({
              username: loginForm.username,
              avatar: '',
              role: 'operator'
            })
            
            ElMessage.success('运营人员登录成功')
            router.push('/')
          }
          else {
            // 登录失败
            ElMessage.error('用户名或密码错误')
          }
          
          loading.value = false
        }, 1000)
      } catch (error) {
        console.error('登录错误:', error)
        ElMessage.error('登录请求失败')
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMjAgMGMxMS4wNDYgMCAyMCA4Ljk1NCAyMCAyMHMtOC45NTQgMjAtMjAgMjBTMCAzMS4wNDYgMCAyMCA4Ljk1NCAwIDIwIDB6Ii8+PC9nPjwvZz48L3N2Zz4=');
  background-repeat: repeat;
  background-position: center;
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  color: #909399;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

.forgot-password {
  float: right;
}

.test-account-tips {
  margin-top: 20px;
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.test-account-tips h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
}

.test-account-tips ul {
  list-style: none;
  padding-left: 0;
}

.test-account-tips li {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.test-account-tips strong {
  font-weight: bold;
}
</style> 