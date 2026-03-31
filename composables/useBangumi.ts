export interface BangumiSubject {
  id: number
  name: string
  name_cn: string
  images: {
    large: string
    medium: string
    small: string
  }
  eps: number
  eps_count: number
  air_date: string
  rating: {
    score: number
    total: number
  }
}

export interface BangumiCollection {
  subject_id: number
  subject: BangumiSubject
  type: number
  rate: number
  ep_status: number
  vol_status: number
  comment: string
  private: boolean
  updated_at: string
}

export interface BangumiCollectionsResponse {
  data: BangumiCollection[]
  total: number
  offset: number
  limit: number
}

export type CollectionType = 0 | 1 | 2 | 3 | 4 | 5

export const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  0: '全部',
  1: '想看',
  2: '看过',
  3: '在看',
  4: '搁置',
  5: '抛弃'
}

const BANGUMI_API_BASE = 'https://api.bgm.tv/v0'

export const useBangumi = () => {
  const getBangumiCollections = async (
    username: string,
    options: {
      subject_type?: number
      type?: CollectionType
      limit?: number
      offset?: number
    } = {}
  ): Promise<BangumiCollectionsResponse> => {
    const params = new URLSearchParams()
    
    if (options.subject_type !== undefined) {
      params.append('subject_type', options.subject_type.toString())
    }
    if (options.type !== undefined && options.type !== 0) {
      params.append('type', options.type.toString())
    }
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString())
    }
    if (options.offset !== undefined) {
      params.append('offset', options.offset.toString())
    }

    const url = `${BANGUMI_API_BASE}/users/${username}/collections?${params.toString()}`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch bangumi collections: ${response.statusText}`)
    }

    return response.json()
  }

  return {
    getBangumiCollections
  }
}
