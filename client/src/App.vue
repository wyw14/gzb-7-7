<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" @success="onLoginSuccess" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import LoginModal from './components/LoginModal.vue'

const showLoginModal = ref(false)

function requireLogin() {
  showLoginModal.value = true
}

provide('requireLogin', requireLogin)

function onLoginSuccess() {
  showLoginModal.value = false
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
