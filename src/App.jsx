import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Inventory from './pages/Inventory'
import DeliveryChallan from './pages/DeliveryChallan'
import Invoice from './pages/Invoice'
import WarrantyValidator from './pages/WarrantyValidator'
import CreateUser from './pages/CreateUser'
import Quotation from './pages/Quotation'


function Shell({ title, children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto scrollbar-thin px-4 md:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />


      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Shell title="Dashboard">
              <Dashboard />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Shell title="Customers">
              <Customers />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Shell title="Inventory">
              <Inventory />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/challan"
        element={
          <ProtectedRoute>
            <Shell title="Delivery Challan">
              <DeliveryChallan />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoice"
        element={
          <ProtectedRoute>
            <Shell title="Invoice">
              <Invoice />
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* =========================
          QUOTATION
      ========================= */}

      <Route
        path="/quotation"
        element={
          <ProtectedRoute>
            <Shell title="Quotation">
              <Quotation />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/warranty"
        element={
          <ProtectedRoute>
            <Shell title="Warranty Validator">
              <WarrantyValidator />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-user"
        element={
          <ProtectedRoute>
            <Shell title="Create User">
              <CreateUser />
            </Shell>
          </ProtectedRoute>
        }
      />


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}