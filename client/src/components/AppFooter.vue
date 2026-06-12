<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-section">
        <div class="footer-logo">
          <span class="logo-icon">🎵</span>
          <span class="logo-text">乐搭</span>
        </div>
        <p class="footer-desc">让闲置乐器流动起来，让练琴不再孤单</p>
      </div>
      <div class="footer-section">
        <h4>乐器流转</h4>
        <ul>
          <li><router-link to="/instruments">浏览乐器</router-link></li>
          <li><router-link to="/publish">发布闲置</router-link></li>
          <li><a href="#">借用指南</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>练习搭子</h4>
        <ul>
          <li><router-link to="/buddies">寻找搭子</router-link></li>
          <li><router-link to="/checkin">练琴打卡</router-link></li>
          <li><a href="#">热门曲目</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>关于我们</h4>
        <ul>
          <li><a href="#">平台介绍</a></li>
          <li><a href="#">使用条款</a></li>
          <li><a href="#">联系客服</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2026 乐搭 - 旧乐器流转与练习搭子平台 | 让音乐连接每一个人</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: #1f2937;
  color: #9ca3af;
  margin-top: 60px;
}

.footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding: 40px 0;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.logo-icon {
  font-size: 32px;
}

.footer-desc {
  line-height: 1.8;
  font-size: 14px;
}

.footer-section h4 {
  color: white;
  font-size: 16px;
  margin-bottom: 16px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 10px;
}

.footer-section a {
  color: #9ca3af;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
}
</style>
