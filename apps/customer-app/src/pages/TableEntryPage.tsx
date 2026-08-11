import { useEffect } from "react"
import { Navigate, useParams } from "react-router-dom"
import { useCart } from "../context/CartContext"

/**
 * QR entry — unsigned table id in the URL (MVP simplification; confirm before launch — brief §9).
 */
export function TableEntryPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const { setTableId } = useCart()

  useEffect(() => {
    if (tableId) setTableId(tableId)
  }, [tableId, setTableId])

  if (!tableId) return <Navigate to="/menu" replace />
  return <Navigate to="/menu" replace />
}
