export interface SnackbarMessage {
  text: string
  title?: string
  color?: 'success' | 'error' | 'warning' | 'info' | 'default'
  timeout?: number
  icon?: string
}

export const useSnackbar = () => {
  const messages = useState<SnackbarMessage[]>('snackbar-messages', () => [])

  const show = (message: SnackbarMessage | string) => {
    const msg: SnackbarMessage = typeof message === 'string' 
      ? { text: message } 
      : message
    messages.value.push(msg)
  }

  const success = (text: string, title?: string) => {
    show({ text, title, color: 'success', icon: 'mdi-check-circle' })
  }

  const error = (text: string, title?: string) => {
    show({ text, title, color: 'error', icon: 'mdi-alert-circle' })
  }

  const warning = (text: string, title?: string) => {
    show({ text, title, color: 'warning', icon: 'mdi-alert' })
  }

  const info = (text: string, title?: string) => {
    show({ text, title, color: 'info', icon: 'mdi-information' })
  }

  const remove = (index: number) => {
    messages.value.splice(index, 1)
  }

  const clear = () => {
    messages.value = []
  }

  return {
    messages: readonly(messages),
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
}
