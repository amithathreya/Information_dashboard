import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import StudentLogin from "./studentlogin";
import Home from "./Home";


function App() {
  return (
    <Router>
      <div>
        {/* Navigation */}
        <nav style={styles.nav}>
          
          <Link to="/login" style={styles.link}>Student Login</Link>
          <Link to="/" style={styles.link}>Home</Link>

        </nav>

        {/* Define routes */}
        <Routes>
          
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/" element={<Home />} />
          
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  nav: {
    padding: "10px",
    background: "#f4f4f4",
    display: "flex",
    gap: "20px",
  },
  link: {
    textDecoration: "none",
    color: "blue",
    fontWeight: "bold",
  },
};

export default App;
