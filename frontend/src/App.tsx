import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Home } from "@/components/landing/Home"
import { LearnMore } from "@/components/landing/LearnMore"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn-more" element={<LearnMore />} />
      </Routes>
    </Router>
  )
}

export default App
