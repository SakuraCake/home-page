<template>
  <div class="github-page">
    <mdui-card style="margin-bottom: 24px;">
      <div style="padding: 24px;">
        <mdui-avatar style="width: 96px; height: 96px;">
          <img v-if="userData?.avatar_url" :src="userData.avatar_url" />
        </mdui-avatar>
        <h1 style="margin: 16px 0 8px 0;">{{ userData?.name || userData?.login }}</h1>
        <p style="margin: 0; color: #666;">{{ userData?.bio }}</p>
        <div style="margin-top: 16px; display: flex; gap: 24px; flex-wrap: wrap;">
          <div>
            <strong>{{ userData?.public_repos }}</strong> 仓库
          </div>
          <div>
            <strong>{{ userData?.followers }}</strong> 关注者
          </div>
          <div>
            <strong>{{ userData?.following }}</strong> 关注
          </div>
        </div>
        <div style="margin-top: 16px;">
          <mdui-button href="https://github.com/SakuraCake" target="_blank">
            访问 GitHub 主页
          </mdui-button>
        </div>
      </div>
    </mdui-card>

    <mdui-segmented-button-group v-model="repoFilter" style="margin-bottom: 16px;">
      <mdui-segmented-button value="all">全部</mdui-segmented-button>
      <mdui-segmented-button value="source">源码</mdui-segmented-button>
      <mdui-segmented-button value="fork">Fork</mdui-segmented-button>
    </mdui-segmented-button-group>

    <div v-if="loading" style="text-align: center; padding: 48px;">
      <mdui-circular-progress indeterminate></mdui-circular-progress>
    </div>

    <div v-else class="repo-grid">
      <mdui-card v-for="repo in filteredRepos" :key="repo.id" class="repo-card">
        <div style="padding: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style="flex-shrink: 0;">
              <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <a :href="repo.html_url" target="_blank" style="font-size: 18px; font-weight: 500; color: #6750A4; text-decoration: none;">
              {{ repo.name }}
            </a>
            <mdui-chip v-if="repo.fork" size="small" style="margin-left: auto;">Fork</mdui-chip>
          </div>
          <p style="margin: 8px 0 16px 0; color: #666; font-size: 14px;">
            {{ repo.description || '暂无描述' }}
          </p>
          <div style="display: flex; align-items: center; gap: 16px; font-size: 13px; color: #666; flex-wrap: wrap;">
            <span v-if="repo.language" style="display: flex; align-items: center; gap: 4px;">
              <span class="language-dot" :style="{ backgroundColor: getLanguageColor(repo.language) }"></span>
              {{ repo.language }}
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              {{ repo.stargazers_count }}
            </span>
            <span style="display: flex; align-items: center; gap: 4px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
              {{ repo.forks_count }}
            </span>
            <span style="margin-left: auto;">
              更新于 {{ formatDate(repo.updated_at) }}
            </span>
          </div>
        </div>
      </mdui-card>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
}

interface GitHubRepo {
  id: number
  name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string
  updated_at: string
  fork: boolean
}

const userData = ref<GitHubUser | null>(null)
const repos = ref<GitHubRepo[]>([])
const loading = ref(true)
const repoFilter = ref('all')

const filteredRepos = computed(() => {
  if (repoFilter.value === 'all') {
    return repos.value
  } else if (repoFilter.value === 'source') {
    return repos.value.filter(repo => !repo.fork)
  } else {
    return repos.value.filter(repo => repo.fork)
  }
})

const getLanguageColor = (language: string) => {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Vue: '#41b883',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Shell: '#89e051',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
  }
  return colors[language] || '#666'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch('https://api.github.com/users/SakuraCake'),
      fetch('https://api.github.com/users/SakuraCake/repos?sort=updated&per_page=100')
    ])
    
    userData.value = await userResponse.json()
    repos.value = await reposResponse.json()
  } catch (error) {
    console.error('Failed to fetch GitHub data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.github-page {
  max-width: 1200px;
  margin: 0 auto;
}

.repo-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .repo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.repo-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.repo-card:hover {
  transform: translateY(-2px);
}

.language-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

a:hover {
  text-decoration: underline;
}
</style>
