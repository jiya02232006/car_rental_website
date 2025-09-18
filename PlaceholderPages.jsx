import React from 'react'

// Placeholder component for missing pages
const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-secondary-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">{title}</h1>
        <p className="text-xl text-secondary-600 mb-8">{description}</p>
        <div className="bg-white p-8 rounded-lg shadow-card">
          <p className="text-secondary-500">This page is under construction.</p>
        </div>
      </div>
    </div>
  )
}

// Individual page components
export const Cars = () => (
  <PlaceholderPage 
    title="Our Fleet" 
    description="Browse our extensive collection of rental vehicles" 
  />
)

export const CarDetails = () => (
  <PlaceholderPage 
    title="Car Details" 
    description="Detailed information about the selected vehicle" 
  />
)

export const About = () => (
  <PlaceholderPage 
    title="About Us" 
    description="Learn more about our car rental service" 
  />
)

export const Contact = () => (
  <PlaceholderPage 
    title="Contact Us" 
    description="Get in touch with our support team" 
  />
)

export const Login = () => (
  <PlaceholderPage 
    title="Login" 
    description="Sign in to your account" 
  />
)

export const Register = () => (
  <PlaceholderPage 
    title="Register" 
    description="Create your account" 
  />
)

export const Dashboard = () => (
  <PlaceholderPage 
    title="Dashboard" 
    description="Welcome to your customer dashboard" 
  />
)

export const Bookings = () => (
  <PlaceholderPage 
    title="My Bookings" 
    description="View and manage your rental bookings" 
  />
)

export const Profile = () => (
  <PlaceholderPage 
    title="Profile" 
    description="Manage your account settings" 
  />
)

export const AdminDashboard = () => (
  <PlaceholderPage 
    title="Admin Dashboard" 
    description="Administrative overview and controls" 
  />
)

export const AdminCars = () => (
  <PlaceholderPage 
    title="Manage Cars" 
    description="Add, edit, and manage the vehicle fleet" 
  />
)

export const AdminBookings = () => (
  <PlaceholderPage 
    title="Manage Bookings" 
    description="View and manage all customer bookings" 
  />
)

export const AdminUsers = () => (
  <PlaceholderPage 
    title="Manage Users" 
    description="View and manage user accounts" 
  />
)

// Route protection components
export const ProtectedRoute = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-card">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Authentication Required</h2>
          <p className="text-secondary-600">Please log in to access this page.</p>
        </div>
      </div>
    </div>
  )
}

export const AdminRoute = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-card">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Admin Access Required</h2>
          <p className="text-secondary-600">You need administrator privileges to access this page.</p>
        </div>
      </div>
    </div>
  )
}