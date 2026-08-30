import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { SpinWheelPage } from "./pages/SpinWheelPage"
import { CartProvider } from "./context/CartContext"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { StoryPage } from "./pages/StoryPage"
import { MenuPage } from "./pages/MenuPage"
import { JournalPage, JournalPostPage } from "./pages/JournalPage"
import { MemoryWallPage } from "./pages/MemoryWallPage"
import { VisitPage } from "./pages/VisitPage"
import { LegalPage } from "./pages/LegalPage"
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
            <Route path="spin" element={<SpinWheelPage />} />
            <Route path="t/:tableId" element={<TableEntryPage />} />
            <Route path="order/:orderId" element={<OrderStatusPage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="journal/:slug" element={<JournalPostPage />} />
            <Route path="memory-wall" element={<MemoryWallPage />} />
            <Route path="visit" element={<VisitPage />} />
            <Route path="contact" element={<VisitPage />} />
            <Route path="privacy" element={<LegalPage />} />
            <Route path="terms" element={<LegalPage />} />
            <Route path="refunds" element={<LegalPage />} />
            <Route path="shipping" element={<LegalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
