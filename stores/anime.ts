import { defineStore } from 'pinia'
import type { BangumiCollection, CollectionType } from '~/composables/useBangumi'

interface AnimeState {
  collections: BangumiCollection[]
  total: number
  loading: boolean
  error: string | null
  filterType: CollectionType
  offset: number
  limit: number
}

export const useAnimeStore = defineStore('anime', {
  state: (): AnimeState => ({
    collections: [],
    total: 0,
    loading: false,
    error: null,
    filterType: 0,
    offset: 0,
    limit: 24
  }),

  getters: {
    hasMore: (state) => state.offset + state.limit < state.total,
    filteredCollections: (state) => {
      if (state.filterType === 0) {
        return state.collections
      }
      return state.collections.filter(c => c.type === state.filterType)
    }
  },

  actions: {
    async fetchCollections(username: string, append = false) {
      const { getBangumiCollections } = useBangumi()
      
      this.loading = true
      this.error = null

      try {
        const response = await getBangumiCollections(username, {
          subject_type: 2,
          type: this.filterType === 0 ? undefined : this.filterType,
          limit: this.limit,
          offset: append ? this.offset : 0
        })

        if (append) {
          this.collections = [...this.collections, ...response.data]
        } else {
          this.collections = response.data
        }
        
        this.total = response.total
        this.offset = append ? this.offset + response.data.length : response.data.length
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Failed to fetch collections'
      } finally {
        this.loading = false
      }
    },

    async loadMore(username: string) {
      if (this.loading || !this.hasMore) return
      await this.fetchCollections(username, true)
    },

    setFilterType(type: CollectionType) {
      this.filterType = type
      this.offset = 0
      this.collections = []
    },

    reset() {
      this.collections = []
      this.total = 0
      this.loading = false
      this.error = null
      this.filterType = 0
      this.offset = 0
    }
  }
})
