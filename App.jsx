import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './simple.css'

// Simple Home Page Component
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-content">
            <div>
              <h1 className="logo">🚗 CarRental</h1>
            </div>
            <div className="nav-buttons">
              <button className="btn btn-primary">
                Login
              </button>
              <button className="btn btn-secondary">
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to Car Rental System</h1>
          <p>
            Find and rent the perfect car for your next adventure. 
            Our modern platform makes car rental simple, fast, and reliable.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">
              Browse Cars
            </button>
            <button className="btn btn-outline">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <p className="subtitle">We provide the best car rental experience</p>
          
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon blue">
                <span>🚗</span>
              </div>
              <h3>Wide Selection</h3>
              <p>Choose from hundreds of cars including economy, luxury, and SUVs</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon green">
                <span>💰</span>
              </div>
              <h3>Best Prices</h3>
              <p>Competitive rates with no hidden fees or surprise charges</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon purple">
                <span>⭐</span>
              </div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer service for all your needs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="status-alert">
        <div className="container">
          <div className="alert">
            <div className="alert-icon">
              ⚠️
            </div>
            <div className="alert-content">
              <h4>Development Status</h4>
              <p>
                🎉 Frontend: Running ✅ | 
                ⏳ Backend: Connected ✅ | 
                🔧 Database: Mock Data ✅
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Car Rental System. Built with React & Node.js</p>
        </div>
      </footer>
    </div>
  )
}

// About Page
const About = () => {
  return (
    <div className="about-page">
      <div className="about-content">
        <h1>About Us</h1>
        <p>
          Welcome to our Car Rental System - a modern, full-stack application built with the latest technologies.
        </p>
        <div className="tech-card">
          <h2>Technology Stack</h2>
          <ul className="tech-list">
            <li><strong>Frontend:</strong> React 18, Vite, Custom CSS</li>
            <li><strong>Backend:</strong> Node.js, Express.js, JWT Authentication</li>
            <li><strong>Database:</strong> MySQL with stored procedures</li>
            <li><strong>Deployment:</strong> Docker, Docker Compose</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App