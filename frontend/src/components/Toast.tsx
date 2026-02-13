import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  show: (msg: string, variant?: ToastVariant) => void
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  show: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
})

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}

let toastSeq = 0

export function ToastProvider({
  children,
}: {
  children: ReactNode
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = ++toastSeq
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }])
      setTimeout(() => removeToast(id), 3000)
    },
    [removeToast]
  )

  const success = useCallback(
    (msg: string) => show(msg, 'success'),
    [show]
  )
  const error = useCallback(
    (msg: string) => show(msg, 'error'),
    [show]
  )
  const info = useCallback(
    (msg: string) => show(msg, 'info'),
    [show]
  )

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}
      <div className="fixed top-4 left-4 right-4 z-[999] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastBubble
            key={t.id}
            item={t}
            onDismiss={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastBubble({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: () => void
}) {
  const startY = useRef<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(-20px)'
    requestAnimationFrame(() => {
      el.style.transition = 'all 0.3s ease-out'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  const variantCls = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-gray-800 text-white',
  }[item.variant]

  const icon = {
    success: '\u2705',
    error: '\u274c',
    info: '\u2139\ufe0f',
  }[item.variant]

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? null
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return
    const endY = e.changedTouches[0]?.clientY ?? 0
    if (startY.current - endY > 30) {
      onDismiss()
    }
    startY.current = null
  }

  return (
    <div
      ref={ref}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onDismiss}
      className={`pointer-events-auto w-full max-w-sm rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 cursor-pointer ${variantCls}`}
    >
      <span className="text-base">{icon}</span>
      <p className="flex-1 text-sm font-medium">{item.message}</p>
    </div>
  )
}
