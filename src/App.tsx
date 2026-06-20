import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DetectiveBoard from "@/pages/DetectiveBoard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DetectiveBoard />} />
      </Routes>
    </Router>
  );
}
