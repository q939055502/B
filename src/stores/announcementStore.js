// 公告数据store
import { defineStore } from 'pinia';
import { getLatestAnnouncement } from '@/api/announcementAPI';

export const useAnnouncementStore = defineStore('announcement', {
  state: () => ({
    latestAnnouncement: null,
    loading: false,
    error: null
  }),

  actions: {
    /**
     * 加载最新公告
     */
    async loadLatestAnnouncement() {
      this.loading = true;
      this.error = null;

      try {
        const response = await getLatestAnnouncement();

        this.latestAnnouncement = response.data.data[0];

      } catch (err) {
        this.error = '获取公告失败: ' + (err.message || '未知错误');
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    }
  },

  getters: {
    hasAnnouncement: (state) => !!state.latestAnnouncement
  }
});