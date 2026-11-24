
import { useState } from 'react'
import {
  BusFront, Mail, Lock, User, Phone,
  Eye, EyeOff, ArrowLeft
} from 'lucide-react'

export default function Auth({ onClose }) {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  const isSignup = mode === 'signup'

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage('')

    if (isSignup && password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    if (isSignup && !/^[6-9]\d{9}$/.test(phone)) {
      setMessage('Enter a valid 10-digit mobile number.')
      return
    }

    setMessage(
      isSignup
        ? 'Account details validated! Backend registration will be connected next.'
        : 'Login form validated! Backend authentication will be connected next.'
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* Left Side */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 text-white p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-3 rounded-xl">
                <BusFront size={30} />
              </div>
              <h1 className="text-2xl font-extrabold">
                Erode<span className="text-amber-300">SmartBus</span>
              </h1>
            </div>

            <h2 className="text-4xl font-black leading-tight mt-20">
              Your journey.<br />
              Your comfort.<br />
              <span className="text-amber-300">Your choice.</span>
            </h2>

            <p className="text-blue-100 mt-6 leading-relaxed">
              Book bus seats, manage your tickets and stay connected
              throughout your journey.
            </p>
          </div>

          <p className="text-sm text-blue-200">
            Making every journey simpler. © 2026 Erode Smart Bus.
          </p>
        </div>

        {/* Right Side */}
        <div className="p-7 sm:p-10 md:p-12">

          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-700 mb-10"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

          <div className="md:hidden flex items-center gap-2 mb-8">
            <BusFront className="text-blue-700" size={27} />
            <h1 className="font-extrabold text-xl">
              Erode<span className="text-blue-700">SmartBus</span>
            </h1>
          </div>

          <h2 className="text-3xl font-extrabold">
            {isSignup ? 'Create your account' : 'Welcome back!'}
          </h2>

          <p className="text-slate-500 mt-2">
            {isSignup
              ? 'Join us and make your journeys easier.'
              : 'Login to manage your bus journeys.'}
          </p>

          {/* Login / Signup Tabs */}
          <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mt-8">
            <button
              onClick={() => {
                setMode('login')
                setMessage('')
              }}
              className={`py-3 rounded-lg font-semibold text-sm ${
                !isSignup
                  ? 'bg-white shadow text-blue-700'
                  : 'text-slate-500'
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                setMode('signup')
                setMessage('')
              }}
              className={`py-3 rounded-lg font-semibold text-sm ${
                isSignup
                  ? 'bg-white shadow text-blue-700'
                  : 'text-slate-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mt-8">

            {isSignup && (
              <>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-600">
                    Full Name
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-xl mt-2 px-3">
                    <User size={19} className="text-slate-400" />
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-600">
                    Mobile Number
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-xl mt-2 px-3">
                    <Phone size={19} className="text-slate-400" />
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="10-digit mobile number"
                      className="w-full p-3 outline-none"
                    />
                  </div>
                </label>
              </>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-slate-600">
                Email Address
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl mt-2 px-3">
                <Mail size={19} className="text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full p-3 outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-600">
                Password
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl mt-2 px-3">
                <Lock size={19} className="text-slate-400" />
                <input
                  required
                  minLength={8}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full p-3 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            {isSignup && (
              <label className="block">
                <span className="text-sm font-semibold text-slate-600">
                  Confirm Password
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl mt-2 px-3">
                  <Lock size={19} className="text-slate-400" />
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full p-3 outline-none"
                  />
                </div>
              </label>
            )}

            {message && (
              <div className="bg-blue-50 text-blue-800 border border-blue-100 rounded-xl p-3 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition"
            >
              {isSignup ? 'Create Account' : 'Login to Your Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-7">
            {isSignup
              ? 'Already have an account?'
              : "Don't have an account?"}

            <button
              onClick={() => {
                setMode(isSignup ? 'login' : 'signup')
                setMessage('')
              }}
              className="text-blue-700 font-bold ml-2"
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>

          <p className="text-xs text-center text-slate-400 mt-8">
            Your journey starts with Erode Smart Bus.
          </p>
        </div>
      </div>
    </div>
  )
}
