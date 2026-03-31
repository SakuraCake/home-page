export interface SocialLink {
  name: string
  url: string
  icon: string
}

export interface AppConfig {
  name: string
  version: string
  domain: string
  socialLinks: SocialLink[]
  bangumi: {
    username: string
  }
}

export const appConfig: AppConfig = {
  name: 'SakuraCake',
  version: '0.1.1',
  domain: 'sorange.top',
  socialLinks: [
    {
      name: 'Bilibili',
      url: 'https://space.bilibili.com/1750469453',
      icon: 'mdi-bilibili'
    },
    {
      name: 'Steam',
      url: 'https://steamcommunity.com/id/SakuraCake/',
      icon: 'mdi-steam'
    }
  ],
  bangumi: {
    username: 'sakuracake'
  }
}
