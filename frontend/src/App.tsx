import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Home } from "@/components/landing/Home"
import { LearnMore } from "@/components/landing/LearnMore"
import { Layout } from "@/components/layout/Layout"
import { History } from "@/components/history/History"
import { GridCanvas } from "@/components/grid/GridCanvas"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="learn-more" element={<LearnMore />} />
          <Route path="dashboard" element={<GridCanvas />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
