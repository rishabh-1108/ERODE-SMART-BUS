import { useEffect, useState } from 'react'
import Auth from './Auth'
import API from './axios'
import {
  BusFront, MapPin, CalendarDays, ArrowLeftRight, Search,
  Ticket, Map, User, Languages, ShieldCheck, Clock, Wifi,
  Armchair, X, CheckCircle2, LogOut, QrCode, CreditCard
} from 'lucide-react'
import './index.css'

const cities = [
  'Erode', 'Coimbatore', 'Salem', 'Tiruppur',
  'Chennai', 'Bengaluru', 'Gobichettipalayam', 'Bhavani'
]

// Temporary demonstration data. Replace with published schedules later.
const demoBuses = [
  {
    id: 1, name: 'Erode Express', number: 'TN 33 AB 1234',
    type: 'AC Seater', departure: '06:30 AM',
    arrival: '08:30 AM', fare: 180, seats: 24
  },
  {
    id: 2, name: 'Kongu Travels', number: 'TN 33 CD 5678',
    type: 'Non-AC Seater', departure: '09:00 AM',
    arrival: '11:15 AM', fare: 140, seats: 18
  },
  {
    id: 3, name: 'City Connect', number: 'TN 33 EF 9012',
    type: 'AC Sleeper', departure: '10:30 AM',
    arrival: '12:30 PM', fare: 250, seats: 12
  }
]

const bookedSeats = ['S3', 'S8', 'S12']

export default function App() {
  const [authPage, setAuthPage] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })

  const [from, setFrom] = useState('Erode')
  const [to, setTo] = useState('Coimbatore')
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
  const [language, setLanguage] = useState('EN')

  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [selectedBus, setSelectedBus] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [passengerName, setPassengerName] = useState('')
  const [passengerPhone, setPassengerPhone] = useState('')
  const [bookingPreview, setBookingPreview] = useState(false)

  const [booking, setBooking] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const tamil = language === 'தமிழ்'
  const totalFare = selectedBus ? selectedSeats.length * selectedBus.fare : 0

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      window.location.href = '/admin'
    }
  }, [user])

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
    setAuthPage(false)
    setError('')
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    setTicket(null)
    setBooking(null)
    setSelectedBus(null)
    setSelectedSeats([])
    setBookingPreview(false)
  }

  const search = () => {
    if (from === to) {
      setError('Please select different boarding and destination cities.')
      setSearched(false)
      return
    }

    if (!date) {
      setError('Please select your journey date.')
      setSearched(false)
      return
    }

    setError('')
    setSelectedBus(null)
    setSelectedSeats([])
    setBookingPreview(false)
    setBooking(null)
    setTicket(null)
    setSearched(true)

    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const chooseBus = (bus) => {
    setSelectedBus(bus)
    setSelectedSeats([])
    setPassengerName(user?.full_name || '')
    setPassengerPhone('')
    setBookingPreview(false)
    setBookingError('')

    setTimeout(() => {
      document.getElementById('seat-selection')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const toggleSeat = (seat) => {
    setSelectedSeats(previous =>
      previous.includes(seat)
        ? previous.filter(item => item !== seat)
        : [...previous, seat]
    )
    setBookingPreview(false)
  }

  const continueBooking = () => {
    if (!user) {
      setAuthPage(true)
      return
    }

    if (!selectedSeats.length || !passengerName.trim()) return

    if (!/^[6-9]\d{9}$/.test(passengerPhone)) {
      setBookingError('Enter a valid 10-digit mobile number.')
      return
    }

    setBookingError('')
    setBookingPreview(true)
  }

  const createBooking = async () => {
    if (!user) {
      setAuthPage(true)
      return
    }

    setBookingLoading(true)
    setBookingError('')

    try {
      const response = await API.post(
        'bookings/create/',
        {
          passenger_name: passengerName.trim(),
          passenger_phone: passengerPhone,
          bus_name: selectedBus.name,
          bus_number: selectedBus.number,
          from_location: from,
          to_location: to,
          journey_date: date,
          seat_numbers: selectedSeats,
          total_amount: totalFare
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      )

      setBooking(response.data)
      setBookingPreview(false)
      setBookingError(
        `Booking created: ${response.data.booking_reference || 'Please continue to payment.'}`
      )
    } catch (err) {
      setBookingError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to create booking. Please check the backend and try again.'
      )
    } finally {
      setBookingLoading(false)
    }
  }

  const makeDemoPayment = async () => {
    const bookingId = booking?.booking_id || booking?.id

    if (!bookingId) {
      setBookingError('Booking ID is missing. Please create the booking again.')
      return
    }

    setPaymentLoading(true)
    setBookingError('')

    try {
      const response = await API.post(
        `bookings/${bookingId}/demo-payment/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      )

      setTicket({
        ...response.data,
        booking_reference: booking.booking_reference,
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        bus_name: selectedBus.name,
        bus_number: selectedBus.number,
        from_location: from,
        to_location: to,
        journey_date: date,
        seat_numbers: selectedSeats,
        total_amount: totalFare
      })

      setTimeout(() => {
        document.getElementById('my-ticket')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      setBookingError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Demo payment failed. Please try again.'
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  if (authPage) {
    return (
      <Auth
        onClose={() => setAuthPage(false)}
        onLogin={handleLogin}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* NAVIGATION */}
      <header className="bg-white border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="bg-blue-700 text-white p-2 rounded-xl">
              <BusFront size={27} />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight">
                Erode<span className="text-blue-700">SmartBus</span>
              </h1>
              <p className="text-xs text-slate-500">Your journey, made simple</p>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#" className="text-blue-700">Home</a>
            <a href="#services">Our Services</a>
            <a href="#about">About</a>

            <button
              onClick={() => setLanguage(tamil ? 'EN' : 'தமிழ்')}
              className="flex items-center gap-2 hover:text-blue-700"
            >
              <Languages size={17} /> {language}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-600">
                  Hi, {user.full_name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl"
                >
                  <LogOut size={17} /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthPage(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl flex gap-2 items-center transition"
              >
                <User size={17} /> Login
              </button>
            )}
          </div>

          <button
            onClick={() => user ? logout() : setAuthPage(true)}
            className="md:hidden text-blue-700 flex items-center gap-2 font-semibold"
          >
            {user ? <LogOut size={19} /> : <User size={19} />}
            {user ? 'Logout' : 'Login'}
          </button>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-5 pt-16 pb-32">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm">
                <ShieldCheck size={16} /> Easy. Safe. Reliable.
              </span>

              <h2 className="text-4xl md:text-6xl font-black leading-tight mt-6">
                {tamil ? 'ஒவ்வொரு பயணமும்' : 'Every journey'}
                <br />
                {tamil ? 'எங்களுடன் தொடங்கட்டும்' : 'starts '}
                {!tamil && <span className="text-amber-300">with us.</span>}
              </h2>

              <p className="text-blue-100 mt-5 text-lg">
                Find buses, reserve your seats and track your journey — all in one place.
              </p>
            </div>
          </div>
        </section>

        {/* BUS SEARCH */}
        <section className="max-w-6xl mx-auto px-5 -mt-20 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-950/15 p-6 md:p-9">
            <div className="flex items-center gap-2 mb-7">
              <BusFront className="text-blue-700" />
              <h3 className="font-bold text-xl">
                {tamil ? 'எங்கு செல்ல விரும்புகிறீர்கள்?' : 'Where would you like to go?'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_1fr_auto] gap-4 items-end">
              <label className="block min-w-0">
                <span className="text-sm font-semibold text-slate-600">From</span>
                <div className="mt-2 flex items-center border border-slate-200 rounded-xl px-3 bg-slate-50">
                  <MapPin className="text-blue-700 shrink-0" size={19} />
                  <select
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="w-full min-w-0 bg-transparent p-3 outline-none"
                  >
                    {cities.map(city => <option key={city}>{city}</option>)}
                  </select>
                </div>
              </label>

              <label className="block min-w-0">
                <span className="text-sm font-semibold text-slate-600">To</span>
                <div className="mt-2 flex items-center border border-slate-200 rounded-xl px-3 bg-slate-50">
                  <MapPin className="text-rose-500 shrink-0" size={19} />
                  <select
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="w-full min-w-0 bg-transparent p-3 outline-none"
                  >
                    {cities.map(city => <option key={city}>{city}</option>)}
                  </select>
                </div>
              </label>

              <button
                onClick={() => {
                  setFrom(to)
                  setTo(from)
                  setSearched(false)
                  setError('')
                }}
                className="hidden xl:flex items-center justify-center p-3 rounded-xl border border-slate-200 text-blue-700 hover:bg-blue-50"
                title="Swap locations"
              >
                <ArrowLeftRight size={20} />
              </button>

              <label className="block min-w-0">
                <span className="text-sm font-semibold text-slate-600">Journey date</span>
                <div className="mt-2 flex items-center border border-slate-200 rounded-xl px-3 bg-slate-50">
                  <CalendarDays className="text-blue-700 shrink-0" size={19} />
                  <input
                    type="date"
                    min={new Date().toLocaleDateString('en-CA')}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full min-w-0 bg-transparent p-3 outline-none"
                  />
                </div>
              </label>

              <button
                onClick={search}
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl px-6 py-4 flex justify-center items-center gap-2"
              >
                <Search size={19} /> Search
              </button>
            </div>

            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

            <p className="text-xs text-slate-400 mt-5">
              Choose your route and travel date to get started.
            </p>
          </div>
        </section>

        {/* BUS RESULTS */}
        {searched && (
          <section id="results" className="max-w-6xl mx-auto px-5 py-14">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold">Available Buses</h2>
                <p className="text-slate-500 mt-2">{from} → {to} · {date}</p>
              </div>

              <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                {demoBuses.length} Demo Buses
              </span>
            </div>

            <div className="space-y-4">
              {demoBuses.map(bus => (
                <div
                  key={bus.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-lg transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
                        <BusFront size={26} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{bus.name}</h3>
                        <p className="text-sm text-slate-500">{bus.type}</p>
                        <p className="text-xs text-slate-400">{bus.number}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-lg">{bus.departure}</p>
                        <p className="text-sm text-slate-500">{from}</p>
                      </div>
                      <div className="text-slate-400">────→</div>
                      <div>
                        <p className="font-bold text-lg">{bus.arrival}</p>
                        <p className="text-sm text-slate-500">{to}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xl font-extrabold">₹{bus.fare}</p>
                      <p className="text-xs text-slate-500">Per seat</p>
                    </div>

                    <div>
                      <p className="text-sm text-green-700 font-semibold mb-2">
                        Demo seat count: {bus.seats}
                      </p>
                      <button
                        onClick={() => chooseBus(bus)}
                        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold w-full"
                      >
                        View Seats
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-amber-700 mt-5">
              Demonstration schedules only. These are not live bus availability or confirmed operator inventory.
            </p>
          </section>
        )}

        {/* SEAT SELECTION */}
        {selectedBus && !ticket && (
          <section id="seat-selection" className="max-w-5xl mx-auto px-5 pb-14">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-lg">
              <div className="flex justify-between items-center mb-7">
                <div>
                  <h2 className="text-2xl font-extrabold">Choose Your Seats</h2>
                  <p className="text-slate-500 mt-1">
                    {selectedBus.name} · {from} to {to}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedBus(null)
                    setSelectedSeats([])
                    setBookingPreview(false)
                    setBooking(null)
                  }}
                  className="p-2 rounded-full hover:bg-slate-100"
                >
                  <X />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="font-bold text-lg mb-5">Select Available Seats</h3>

                  <div className="flex flex-wrap gap-4 text-sm mb-6">
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-slate-200" /> Available
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-blue-700" /> Selected
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-slate-400" /> Demo unavailable
                    </span>
                  </div>

                  <div className="border-2 border-slate-200 rounded-2xl p-5 max-w-sm mx-auto">
                    <div className="flex justify-between items-center mb-7">
                      <span className="text-sm text-slate-500">Front</span>
                      <BusFront className="text-blue-700" size={25} />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: 16 }, (_, i) => {
                        const seat = `S${i + 1}`
                        const booked = bookedSeats.includes(seat)
                        const selected = selectedSeats.includes(seat)

                        return (
                          <button
                            key={seat}
                            disabled={booked}
                            onClick={() => toggleSeat(seat)}
                            className={`h-14 rounded-lg border font-semibold text-sm transition ${
                              booked
                                ? 'bg-slate-400 text-white border-slate-400 cursor-not-allowed'
                                : selected
                                  ? 'bg-blue-700 text-white border-blue-700'
                                  : 'bg-slate-100 border-slate-300 hover:border-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            <Armchair size={19} className="mx-auto mb-1" />
                            {seat}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-5">Passenger Information</h3>

                  <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Bus</span>
                      <strong>{selectedBus.name}</strong>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Journey</span>
                      <strong>{from} → {to}</strong>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Date</span>
                      <strong>{date}</strong>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Seats</span>
                      <strong className="text-right">
                        {selectedSeats.length ? selectedSeats.join(', ') : 'None'}
                      </strong>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-lg">
                      <strong>Total fare</strong>
                      <strong className="text-blue-700">₹{totalFare}</strong>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-600">
                        Passenger full name
                      </span>
                      <input
                        value={passengerName}
                        onChange={e => {
                          setPassengerName(e.target.value)
                          setBookingPreview(false)
                        }}
                        placeholder="Enter passenger name"
                        className="w-full mt-2 border border-slate-200 rounded-xl p-3 outline-blue-600"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-slate-600">
                        Mobile number
                      </span>
                      <input
                        type="tel"
                        value={passengerPhone}
                        onChange={e => {
                          setPassengerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                          setBookingPreview(false)
                        }}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full mt-2 border border-slate-200 rounded-xl p-3 outline-blue-600"
                      />
                    </label>

                    {bookingError && (
                      <p className="text-sm text-red-600">{bookingError}</p>
                    )}

                    <button
                      disabled={
                        !selectedSeats.length ||
                        !passengerName.trim() ||
                        !/^[6-9]\d{9}$/.test(passengerPhone)
                      }
                      onClick={continueBooking}
                      className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold p-4 rounded-xl transition"
                    >
                      Continue to Booking Summary
                    </button>
                  </div>

                  {bookingPreview && (
                    <div className="mt-6 border border-green-200 bg-green-50 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle2 size={22} />
                        <h3 className="font-bold text-lg">Booking Summary</h3>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-green-800">
                        <p>Passenger: <strong>{passengerName}</strong></p>
                        <p>Mobile: <strong>{passengerPhone}</strong></p>
                        <p>Bus: <strong>{selectedBus.name}</strong></p>
                        <p>Seats: <strong>{selectedSeats.join(', ')}</strong></p>
                        <p>Journey: <strong>{from} → {to}</strong></p>
                        <p>Date: <strong>{date}</strong></p>
                        <p className="text-lg pt-2 border-t border-green-200">
                          Total: <strong>₹{totalFare}</strong>
                        </p>
                      </div>

                      <button
                        onClick={createBooking}
                        disabled={bookingLoading}
                        className="w-full mt-5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-300 text-white font-bold p-4 rounded-xl"
                      >
                        {bookingLoading ? 'Creating booking...' : 'Confirm Booking'}
                      </button>
                    </div>
                  )}

                  {booking && (
                    <div className="mt-5 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="font-bold text-blue-900">
                        Booking created successfully!
                      </p>
                      <p className="text-sm mt-2">
                        Reference: {booking.booking_reference}
                      </p>
                      <p className="text-xs text-blue-800 mt-2">
                        This next step uses the project's demo payment endpoint only.
                      </p>
                      <button
                        onClick={makeDemoPayment}
                        disabled={paymentLoading}
                        className="w-full mt-4 bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2"
                      >
                        <CreditCard size={18} />
                        {paymentLoading ? 'Processing...' : 'Complete Demo Payment'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* GENERATED TICKET */}
        {ticket && (
          <section id="my-ticket" className="max-w-3xl mx-auto px-5 py-14">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-green-700 text-white p-6 text-center">
                <CheckCircle2 size={42} className="mx-auto mb-2" />
                <h2 className="text-2xl font-extrabold">Ticket Generated!</h2>
                <p className="text-green-100 text-sm mt-1">
                  Demo payment completed successfully
                </p>
              </div>

              <div className="p-6 md:p-8">
                <div className="text-center">
                  <p className="text-sm text-slate-500">Booking Reference</p>
                  <h3 className="text-2xl font-black tracking-wider text-blue-800 mt-1">
                    {ticket.booking_reference}
                  </h3>
                </div>

                <div className="flex justify-center my-7">
                  {ticket.qr_image ? (
                    <img
                      src={ticket.qr_image}
                      alt="Your bus ticket QR code"
                      className="w-56 h-56 object-contain border rounded-xl p-2"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500">
                      <QrCode size={55} />
                      <p className="text-sm mt-2">QR image unavailable</p>
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-500">Passenger</p>
                    <strong>{ticket.passenger_name}</strong>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-500">Mobile</p>
                    <strong>{ticket.passenger_phone}</strong>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-500">Bus</p>
                    <strong>{ticket.bus_name}</strong>
                    <p className="text-xs text-slate-500">{ticket.bus_number}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-500">Journey date</p>
                    <strong>{ticket.journey_date}</strong>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-500">Route</p>
                    <strong>{ticket.from_location} → {ticket.to_location}</strong>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-500">Seats</p>
                    <strong>{ticket.seat_numbers?.join(', ')}</strong>
                  </div>
                </div>

                <div className="border-t mt-6 pt-5 flex justify-between items-center">
                  <span className="font-semibold">Total Paid (Demo)</span>
                  <strong className="text-2xl text-blue-700">₹{ticket.total_amount}</strong>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-5 text-sm text-amber-800">
                  This is a demonstration ticket. The payment endpoint is simulated and does not collect real money.
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold p-3 rounded-xl"
                  >
                    Print Ticket
                  </button>
                  <button
                    onClick={() => {
                      setTicket(null)
                      setBooking(null)
                      setSelectedBus(null)
                      setSelectedSeats([])
                      setBookingPreview(false)
                      setSearched(false)
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-3 rounded-xl"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SERVICES */}
        <section id="services" className="max-w-7xl mx-auto px-5 py-20">
          <div className="text-center mb-10">
            <p className="text-blue-700 font-bold text-sm uppercase tracking-widest">
              Everything you need
            </p>
            <h3 className="text-3xl font-extrabold mt-2">Travel made easier</h3>
            <p className="text-slate-500 mt-3">
              All your bus travel needs, in one simple platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              [Ticket, 'Easy Booking', 'Find buses and reserve your seats easily.'],
              [Map, 'Live Tracking', 'Follow your bus journey on the map.'],
              [ShieldCheck, 'Secure Tickets', 'Access your digital QR travel ticket.'],
              [Clock, 'Travel Updates', 'Stay informed about your journey.']
            ].map(([Icon, title, desc]) => (
              <div key={title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition">
                <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <h4 className="font-bold text-lg mt-5">{title}</h4>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="bg-blue-50 py-14">
          <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <BusFront className="mx-auto text-blue-700" size={30} />
              <h4 className="font-bold mt-3">Multiple Bus Services</h4>
              <p className="text-sm text-slate-500 mt-1">Government and private buses</p>
            </div>
            <div>
              <Wifi className="mx-auto text-blue-700" size={30} />
              <h4 className="font-bold mt-3">Connected Journeys</h4>
              <p className="text-sm text-slate-500 mt-1">Booking and tracking together</p>
            </div>
            <div>
              <ShieldCheck className="mx-auto text-blue-700" size={30} />
              <h4 className="font-bold mt-3">Reliable Experience</h4>
              <p className="text-sm text-slate-500 mt-1">Simple and secure travel</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row justify-between gap-4">
          <p className="font-bold text-white">Erode Smart Bus</p>
          <p className="text-sm">Making every journey simpler. © 2026 Erode Smart Bus.</p>
        </div>
      </footer>
    </div>
  )
}