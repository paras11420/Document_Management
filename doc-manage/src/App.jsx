import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";
import Home from "../components/Home";
import Department from "../components/Department";
import UploadDocument from "../components/UploadDocument";
import DocumentList from "../components/DocumentList"; // adjust path as needed
import Report from "../components/Report";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/department" element={<Department />} />
        <Route path="/upload" element={<UploadDocument />} />
        <Route path="/document" element={<DocumentList />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
