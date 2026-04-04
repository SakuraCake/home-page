export default defineNuxtPlugin(() => {
  if (process.client) {
    import('mdui/mdui.css')
    import('mdui')
  }
})
