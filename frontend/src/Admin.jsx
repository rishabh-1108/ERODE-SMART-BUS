
import { useState } from 'react'
import {
  LayoutDashboard, Users, BusFront, MapPin, Ticket,
  CheckCircle, Clock, IndianRupee, Search, Bell,
  Menu, X, LogOut, Plus, Check, XCircle, CalendarDays,
  TrendingUp, ShieldCheck
} from 'lucide-react'

const initialOperators = [
  { id: 1, name: 'Kongu Travels', phone: '9876543210', buses: 4, status: 'Pending' },
  { id: 2, name: 'Erode Express', phone: '9876501234', buses: 2, status: 'Approved' },
  { id: 3, name: 'Sri Murugan Transport', phone: '9876512345', buses: 3, status: 'Pending' },
]

const initialBuses = [
  { id: 1, number: 'TN 33 AB 1234', name: 'Erode Express', from: 'Erode', to: 'Coimbatore', type: 'AC Seater', status: 'Active' },
  { id: 2, number: 'TN 33 CD 5678', name: 'Kongu Travels', from: 'Erode', to: 'Salem', type: 'Non AC', status: 'Active' },
  { id: 3, number: 'TN 38 EF 9012', name: 'Sri Murugan', from: 'Erode', to: 'Chennai', type: 'Sleeper', status: 'Pending' },
]

const initialBookings = [
  { id: 'ESB1001', passenger: 'Arun Kumar', route: 'Erode → Coimbatore', date: '24 Nov 2026', amount: 180, status: 'Confirmed' },
  { id: 'ESB1002', passenger: 'Priya S', route: 'Erode → Salem', date: '24 Nov 2026', amount: 120, status: 'Confirmed' },
  { id: 'ESB1003', passenger: 'Karthik R', route: 'Erode → Chennai', date: '25 Nov 2026', amount: 450, status: 'Pending' },
]

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Passengers', icon: Users },
  { label: 'Operators', icon: ShieldCheck },
  { label: 'Buses', icon: BusFront },
  { label: 'Routes & Schedules', icon: MapPin },
  { label: 'Bookings', icon: Ticket },
]

function Status({ value }) {
  const styles = {
    Active: 'bg-green-100 text-green-700',
    Approved: 'bg-green-100 text-green-700',
    Confirmed: 'bg-green-100 text-green-700',
    Pending: 'bg-amber-100 text-amber-700',
    Rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[value] || 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  )
}

export default function Admin() {
  const [active, setActive] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [operators, setOperators] = useState(initialOperators)
  const [buses, setBuses] = useState(initialBuses)
  const [showBusForm, setShowBusForm] = useState(false)
  const [busForm, setBusForm] = useState({
    number: '', name: '', from: 'Erode', to: 'Coimbatore', type: 'Non AC'
  })

  const approveOperator = (id) => {
    setOperators(items => items.map(item =>
      item.id === id ? { ...item, status: 'Approved' } : item
    ))
  }

  const addBus = (e) => {
    e.preventDefault()
    if (!busForm.number || !busForm.name) return
    setBuses(items => [...items, {
      ...busForm,
      id: Date.now(),
      status: 'Pending'
    }])
    setBusForm({ number: '', name: '', from: 'Erode', to: 'Coimbatore', type: 'Non AC' })
    setShowBusForm(false)
  }

  const filteredBuses = buses.filter(bus =>
    `${bus.number} ${bus.name} ${bus.from} ${bus.to}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const filteredOperators = operators.filter(operator =>
    `${operator.name} ${operator.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  const filteredBookings = initialBookings.filter(booking =>
    `${booking.id} ${booking.passenger} ${booking.route}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const pageTitle = active === 'Dashboard' ? 'Dashboard Overview' : active

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
        <div className="rounded-xl bg-orange-500 p-2.5">
          <BusFront size={25} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Erode Smart Bus</h2>
          <p className="text-xs text-slate-400">Administration</p>
        </div>
      </div>

      <div className="px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>
        <div className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={() => {
                  setActive(item.label)
                  setSearch('')
                  setMobileOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  active === item.label
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-950/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <a href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
          <LogOut size={18} /> Back to Website
        </a>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-800 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">A</div>
          <div>
            <p className="text-sm font-semibold text-white">Administrator</p>
            <p className="text-xs text-slate-400">Admin account</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-100">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 transition-transform lg:static lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between">
          <div className="w-full"><SidebarContent /></div>
          <button className="absolute right-4 top-5 text-white lg:hidden" onClick={() => setMobileOpen(false)}>
            <X />
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="text-slate-700 lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={23} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{pageTitle}</h1>
              <p className="hidden text-xs text-slate-500 sm:block">Manage your Erode Smart Bus platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">Administrator</span>
            <button className="relative rounded-full bg-slate-100 p-2.5 text-slate-600">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          {active === 'Dashboard' && (
            <>
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-slate-900">Welcome, Admin 👋</h2>
                <p className="mt-1 text-sm text-slate-500">Here is what's happening with your bus platform.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Total Passengers', value: '1,248', icon: Users, color: 'bg-blue-100 text-blue-600', trend: '+12% this month' },
                  { label: 'Registered Buses', value: buses.length.toString(), icon: BusFront, color: 'bg-orange-100 text-orange-600', trend: 'Across all operators' },
                  { label: 'Total Bookings', value: '856', icon: Ticket, color: 'bg-purple-100 text-purple-600', trend: '+8% this month' },
                  { label: 'Total Revenue', value: '₹1,24,500', icon: IndianRupee, color: 'bg-green-100 text-green-600', trend: 'Demo statistics' },
                ].map((stat, i) => {
                  const Icon = stat.icon
                  return (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <div className={`rounded-xl p-3 ${stat.color}`}><Icon size={21} /></div>
                      </div>
                      <h3 className="mt-4 text-2xl font-bold text-slate-900">{stat.value}</h3>
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <TrendingUp size={14} className="text-green-600" /> {stat.trend}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-7 grid gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Pending Operator Approvals</h3>
                    <button onClick={() => setActive('Operators')} className="text-sm font-semibold text-orange-600">View all</button>
                  </div>
                  {operators.filter(o => o.status === 'Pending').map(operator => (
                    <div key={operator.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{operator.name}</p>
                        <p className="text-xs text-slate-500">{operator.buses} buses · {operator.phone}</p>
                      </div>
                      <button onClick={() => approveOperator(operator.id)} className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100">
                        Approve
                      </button>
                    </div>
                  ))}
                  {operators.every(o => o.status !== 'Pending') && <p className="text-sm text-slate-500">No pending approvals.</p>}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Recent Bookings</h3>
                    <button onClick={() => setActive('Bookings')} className="text-sm font-semibold text-orange-600">View all</button>
                  </div>
                  {initialBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between gap-3 border-t border-slate-100 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{booking.passenger}</p>
                        <p className="text-xs text-slate-500">{booking.id} · {booking.route}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-800">₹{booking.amount}</p>
                    </div>
                  ))}
                </section>
              </div>
            </>
          )}

          {active !== 'Dashboard' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{active}</h2>
                  <p className="mt-1 text-sm text-slate-500">Manage and review platform records.</p>
                </div>
                {active === 'Buses' && (
                  <button onClick={() => setShowBusForm(!showBusForm)} className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                    <Plus size={17} /> Add Bus
                  </button>
                )}
              </div>

              <div className="relative mb-5 max-w-md">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${active.toLowerCase()}...`} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-400" />
              </div>

              {showBusForm && active === 'Buses' && (
                <form onSubmit={addBus} className="mb-6 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                  <input required placeholder="Bus registration number" value={busForm.number} onChange={e => setBusForm({ ...busForm, number: e.target.value })} className="rounded-lg border p-3 text-sm" />
                  <input required placeholder="Operator / Bus name" value={busForm.name} onChange={e => setBusForm({ ...busForm, name: e.target.value })} className="rounded-lg border p-3 text-sm" />
                  <select value={busForm.from} onChange={e => setBusForm({ ...busForm, from: e.target.value })} className="rounded-lg border p-3 text-sm">
                    {['Erode', 'Salem', 'Coimbatore', 'Tiruppur', 'Chennai'].map(city => <option key={city}>{city}</option>)}
                  </select>
                  <select value={busForm.to} onChange={e => setBusForm({ ...busForm, to: e.target.value })} className="rounded-lg border p-3 text-sm">
                    {['Coimbatore', 'Salem', 'Erode', 'Tiruppur', 'Chennai'].map(city => <option key={city}>{city}</option>)}
                  </select>
                  <select value={busForm.type} onChange={e => setBusForm({ ...busForm, type: e.target.value })} className="rounded-lg border p-3 text-sm">
                    {['Non AC', 'AC Seater', 'Sleeper'].map(type => <option key={type}>{type}</option>)}
                  </select>
                  <button className="rounded-lg bg-slate-900 p-3 text-sm font-semibold text-white">Save Bus</button>
                </form>
              )}

              <div className="overflow-x-auto">
                {active === 'Operators' && (
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Operator</th><th className="p-3">Phone</th><th className="p-3">Buses</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
                    <tbody>{filteredOperators.map(o => <tr key={o.id} className="border-b"><td className="p-3 font-semibold">{o.name}</td><td className="p-3">{o.phone}</td><td className="p-3">{o.buses}</td><td className="p-3"><Status value={o.status} /></td><td className="p-3">{o.status === 'Pending' ? <button onClick={() => approveOperator(o.id)} className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">Approve</button> : <span className="text-slate-400">Approved</span>}</td></tr>)}</tbody>
                  </table>
                )}

                {active === 'Buses' && (
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Bus Number</th><th className="p-3">Operator</th><th className="p-3">Route</th><th className="p-3">Type</th><th className="p-3">Status</th></tr></thead>
                    <tbody>{filteredBuses.map(b => <tr key={b.id} className="border-b"><td className="p-3 font-semibold">{b.number}</td><td className="p-3">{b.name}</td><td className="p-3">{b.from} → {b.to}</td><td className="p-3">{b.type}</td><td className="p-3"><Status value={b.status} /></td></tr>)}</tbody>
                  </table>
                )}

                {active === 'Bookings' && (
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Booking ID</th><th className="p-3">Passenger</th><th className="p-3">Route</th><th className="p-3">Date</th><th className="p-3">Fare</th><th className="p-3">Status</th></tr></thead>
                    <tbody>{filteredBookings.map(b => <tr key={b.id} className="border-b"><td className="p-3 font-semibold">{b.id}</td><td className="p-3">{b.passenger}</td><td className="p-3">{b.route}</td><td className="p-3">{b.date}</td><td className="p-3">₹{b.amount}</td><td className="p-3"><Status value={b.status} /></td></tr>)}</tbody>
                  </table>
                )}

                {active === 'Passengers' && (
                  <div className="rounded-xl bg-slate-50 p-6 text-center">
                    <Users className="mx-auto mb-3 text-slate-400" size={32} />
                    <p className="font-semibold text-slate-700">Passenger management</p>
                    <p className="mt-1 text-sm text-slate-500">Passenger records will appear here after connecting the backend API.</p>
                  </div>
                )}

                {active === 'Routes & Schedules' && (
                  <div className="rounded-xl bg-slate-50 p-6 text-center">
                    <CalendarDays className="mx-auto mb-3 text-slate-400" size={32} />
                    <p className="font-semibold text-slate-700">Route and schedule management</p>
                    <p className="mt-1 text-sm text-slate-500">Route creation, stops, timings and schedule publishing will be connected to Django next.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">© 2026 Erode Smart Bus · Admin Dashboard</p>
        </div>
      </main>
    </div>
  )
}
