import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type CartItem = {
  id: string
  name: string
  /** Price in rupees for display (converted from paise at add time). */
  price: number
  note?: string
  sectionId: string
  sectionTitle: string
  quantity: number
  instructions?: string
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  tableId: string | null
  setTableId: (id: string | null) => void
  setItemInstructions: (id: string, instructions: string) => void
  keepOnlyMenuIds: (ids: string[]) => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = "chote-bade-cart-v2"
const TABLE_KEY = "chote-bade-table-id"

function loadItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [tableId, setTableIdState] = useState<string | null>(null)

  useEffect(() => {
    setItems(loadItems())
    setTableIdState(sessionStorage.getItem(TABLE_KEY))
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, ready])

  const setTableId = useCallback((id: string | null) => {
    setTableIdState(id)
    if (id) sessionStorage.setItem(TABLE_KEY, id)
    else sessionStorage.removeItem(TABLE_KEY)
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((v) => !v), [])

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((p) => p.id !== id)
      return prev.map((p) => (p.id === id ? { ...p, quantity } : p))
    })
  }, [])

  const increment = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p)),
    )
  }, [])

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity: p.quantity - 1 } : p))
        .filter((p) => p.quantity > 0),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const setItemInstructions = useCallback((id: string, instructions: string) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, instructions } : p)),
    )
  }, [])

  const keepOnlyMenuIds = useCallback((ids: string[]) => {
    const allowed = new Set(ids)
    setItems((prev) => prev.filter((item) => allowed.has(item.id)))
  }, [])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQuantity,
      increment,
      decrement,
      clearCart,
      itemCount,
      subtotal,
      tableId,
      setTableId,
      setItemInstructions,
      keepOnlyMenuIds,
    }),
    [
      items,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQuantity,
      increment,
      decrement,
      clearCart,
      itemCount,
      subtotal,
      tableId,
      setTableId,
      setItemInstructions,
      keepOnlyMenuIds,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
