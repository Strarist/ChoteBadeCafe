import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { CartProvider } from "./context/CartContext"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { StoryPage } from "./pages/StoryPage"
import { MenuPage } from "./pages/MenuPage"
import { JournalPage, JournalPostPage } from "./pages/JournalPage"
import { MemoryWallPage } from "./pages/MemoryWallPage"
import { VisitPage } from "./pages/VisitPage"
import { TableEntryPage } from "./pages/TableEntryPage"
import { OrderStatusPage } from "./pages/OrderStatusPage"

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="story" element={<StoryPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="t/:tableId" element={<TableEntryPage />} />
            <Route path="order/:orderId" element={<OrderStatusPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="journal/:slug" element={<JournalPostPage />} />
            <Route path="memory-wall" element={<MemoryWallPage />} />
            <Route path="visit" element={<VisitPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
