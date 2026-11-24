
import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import API from './axios'

export default function Staff() {
  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('staff_user'))
    } catch {
      return null
    }
  })

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  const [scannerActive, setScannerActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)

  const scannerRef = useRef(null)
  const scanLock = useRef(false)

  const staffToken = localStorage.getItem('staff_access_token')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)

    try {
      const response = await API.post('auth/login/', {
        username,
        password,
      })

      const data = response.data
      const role = data.user?.role

      if (!['ADMIN', 'CONDUCTOR'].includes(role)) {
        setLoginError('Access denied. Admin or Conductor account required.')
        setLoading(false)
        return
      }

      localStorage.setItem('staff_access_token', data.access)
      localStorage.setItem('staff_refresh_token', data.refresh)
      localStorage.setItem('staff_user', JSON.stringify(data.user))

      setStaff(data.user)
      setPassword('')
      setScannerActive(true)
    } catch (error) {
      setLoginError(
        error.response?.data?.error || 'Login failed. Check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  const verifyTicket = async (token) => {
    if (scanLock.current) return

    scanLock.current = true
    setScanning(true)
    setScannerActive(false)
    setResult(null)

    try {
      const response = await API.post(
        'bookings/scan/',
        { token },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('staff_access_token')}`,
          },
        }
      )

      setResult({
        success: true,
        data: response.data,
      })
    } catch (error) {
      setResult({
        success: false,
        data: error.response?.data || {
          message: 'Unable to verify ticket. Please try again.',
        },
      })
    } finally {
      setScanning(false)
    }
  }

  useEffect(() => {
    if (!staff || !scannerActive) return

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    )

    scannerRef.current = scanner

    scanner.render(
      (decodedText) => {
        verifyTicket(decodedText)
      },
      () => {}
    )

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [staff, scannerActive])

  const resetScanner = () => {
    scanLock.current = false
    setResult(null)
    setScannerActive(true)
  }

  const logout = () => {
    localStorage.removeItem('staff_access_token')
    localStorage.removeItem('staff_refresh_token')
    localStorage.removeItem('staff_user')

    setStaff(null)
    setScannerActive(false)
    setResult(null)
    scanLock.current = false
  }

  const pageStyle = {
    minHeight: '100vh',
    background: '#07111f',
    color: '#f8fafc',
    padding: '24px 16px',
    fontFamily: 'Arial, sans-serif',
  }

  const panelStyle = {
    maxWidth: '520px',
    margin: '35px auto',
    padding: '28px',
    background: '#111e30',
    border: '1px solid #26364d',
    borderRadius: '18px',
  }

  const inputStyle = {
    width: '100%',
    padding: '13px',
    marginTop: '8px',
    marginBottom: '18px',
    boxSizing: 'border-box',
    background: '#07111f',
    color: 'white',
    border: '1px solid #34445c',
    borderRadius: '9px',
    fontSize: '16px',
  }

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '9px',
    background: '#0d9488',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  }

  if (!staff) {
    return (
      <div style={pageStyle}>
        <div style={panelStyle}>
          <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
            Erode Smart Bus
          </h1>
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>
            Admin & Conductor Portal
          </p>

          <form onSubmit={handleLogin}>
            <label>Username or Email</label>
            <input
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter staff username"
              required
            />

            <label>Password</label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            {loginError && (
              <p style={{ color: '#f87171', marginBottom: '16px' }}>
                {loginError}
              </p>
            )}

            <button style={buttonStyle} disabled={loading}>
              {loading ? 'Logging in...' : 'Staff Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '22px' }}>
            <a href="/" style={{ color: '#5eead4' }}>
              Back to Passenger Website
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '900px', margin: 'auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ marginBottom: '5px' }}>Ticket Verification</h1>
            <p style={{ color: '#94a3b8', marginTop: 0 }}>
              Welcome, {staff.full_name || staff.username} · {staff.role}
            </p>
          </div>

          <button
            onClick={logout}
            style={{
              padding: '10px 18px',
              background: '#334155',
              color: 'white',
              border: 0,
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>

        <div style={panelStyle}>
          <h2 style={{ textAlign: 'center' }}>Scan Passenger QR Ticket</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>
            Point your camera at the passenger's booking QR code.
          </p>

          {scannerActive && (
            <div
              id="qr-reader"
              style={{
                width: '100%',
                overflow: 'hidden',
                background: 'white',
                borderRadius: '10px',
                color: '#111827',
              }}
            />
          )}

          {scanning && (
            <p style={{ textAlign: 'center', color: '#fbbf24' }}>
              Verifying ticket...
            </p>
          )}

          {result && (
            <div
              style={{
                marginTop: '22px',
                padding: '20px',
                borderRadius: '12px',
                background: result.success ? '#064e3b' : '#7f1d1d',
                border: `1px solid ${result.success ? '#10b981' : '#ef4444'}`,
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                {result.success ? '✓ VALID TICKET' : '✕ INVALID TICKET'}
              </h2>

              <p>{result.data.message}</p>

              {result.success && (
                <div style={{ lineHeight: 1.9 }}>
                  <p><b>Booking:</b> {result.data.booking_reference}</p>
                  <p><b>Passenger:</b> {result.data.passenger_name}</p>
                  <p><b>Bus:</b> {result.data.bus_number}</p>
                  <p><b>Route:</b> {result.data.route}</p>
                  <p><b>Seats:</b> {result.data.seats?.join(', ')}</p>
                  <p><b>Journey:</b> {result.data.journey_date}</p>
                </div>
              )}

              {!result.success && result.data.booking_reference && (
                <p>
                  <b>Booking:</b> {result.data.booking_reference}
                </p>
              )}

              <button
                onClick={resetScanner}
                style={{ ...buttonStyle, marginTop: '12px' }}
              >
                Scan Next Ticket
              </button>
            </div>
          )}

          {!scannerActive && !result && !scanning && (
            <button onClick={resetScanner} style={buttonStyle}>
              Start QR Scanner
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
