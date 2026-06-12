import { defineStore } from 'pinia'
import { userApi } from '../api'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    isLoggedIn: false
  }),

  getters: {
    userId: (state) => state.currentUser?.id || null
  },

  actions: {
    async login(username, phone) {
      try {
        const result = await userApi.login({ username, phone })
        if (result.success) {
          this.currentUser = result.user
          this.isLoggedIn = true
          localStorage.setItem('userId', result.user.id)
          localStorage.setItem('userData', JSON.stringify(result.user))
        }
        return result
      } catch (e) {
        throw e
      }
    },

    restoreSession() {
      const userData = localStorage.getItem('userData')
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData)
          this.isLoggedIn = true
        } catch (e) {
          this.logout()
        }
      }
    },

    async refreshUser() {
      if (this.userId) {
        try {
          const user = await userApi.getUser(this.userId)
          this.currentUser = user
          localStorage.setItem('userData', JSON.stringify(user))
        } catch (e) {
          console.error('刷新用户信息失败', e)
        }
      }
    },

    async updateUser(data) {
      if (this.userId) {
        const result = await userApi.updateUser(this.userId, data)
        if (result.success) {
          this.currentUser = result.user
          localStorage.setItem('userData', JSON.stringify(result.user))
        }
        return result
      }
    },

    logout() {
      this.currentUser = null
      this.isLoggedIn = false
      localStorage.removeItem('userId')
      localStorage.removeItem('userData')
    }
  }
})
