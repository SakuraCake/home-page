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
    show({ text, title, color: 'success', icon: 'check_circle' })
  }

  const error = (text: string, title?: string) => {
    show({ text, title, color: 'error', icon: 'error' })
  }

  const warning = (text: string, title?: string) => {
    show({ text, title, color: 'warning', icon: 'warning' })
  }

  const info = (text: string, title?: string) => {
    show({ text, title, color: 'info', icon: 'info' })
  }

  const remove = (index: number) => {
    messages.value.splice(index, 1)
  }

  const clear = (index?: number) => {
    if (index !== undefined) {
      messages.value.splice(index, 1)
    } else {
      messages.value = []
    }
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
