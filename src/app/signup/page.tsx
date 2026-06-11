"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');
  const [step, setStep] = useState<'signup' | 'verify' | 'pending'>('signup');
  const [verificationCode, setVerificationCode] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    
    if (!fullName.trim()) {
      setMessage("Full name is required");
      setMessageType('error');
      return;
    }
    if (!email.trim()) {
      setMessage("Email is required");
      setMessageType('error');
      return;
    }
    if (!password.trim()) {
      setMessage("Password is required");
      setMessageType('error');
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setMessageType('error');
      return;
    }
    if ((role === 'doctor' || role === 'pharmacy') && !licenseFile) {
      setMessage("License document is required for " + role + "s");
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Signup failed');
        setMessageType('error');
      } else {
        setMessage("A verification code has been sent to your email. Check your inbox!");
        setMessageType('success');
        setStep('verify');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!verificationCode.trim()) {
      setMessage("Verification code is required");
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: verificationCode, type: 'signup' })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Verification failed');
        setMessageType('error');
      } else {
        if (data.requiresApproval) {
          setRequiresApproval(true);
          setStep('pending');
          setMessage("Your account has been created and is pending admin approval. You'll receive an email once approved.");
          setMessageType('success');
        } else {
          setMessage("Email verified successfully! Logging you in...");
          setMessageType('success');
          setTimeout(() => {
            router.push('/appointments');
          }, 1500);
        }
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>

      <form onSubmit={step === 'signup' ? handleSignUp : handleVerify} className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl relative z-10 border border-blue-100">
        {step === 'signup' ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-2">SaloneCare</h1>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Join us to access healthcare services</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Full Name</label>
                <input 
                  type="text"
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  disabled={loading}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition" 
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Email</label>
                <input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={loading}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition" 
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={loading}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition" 
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">Account Type</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  disabled={loading}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="pharmacy">Pharmacy</option>
                </select>
              </div>

              {(role === 'doctor' || role === 'pharmacy') && (
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">License Document</label>
                  <input 
                    type="file"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                    disabled={loading}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload your professional license (PDF, JPG, or PNG)</p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link></p>
            </div>
          </>
        ) : step === 'pending' ? (
          <>
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pending Approval</h2>
                <p className="text-gray-600">Your {role} account is awaiting admin verification</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  We have received your application. Our admin team will review your credentials and contact you via email at <span className="font-semibold">{email}</span> once the verification is complete.
                </p>
              </div>

              <button
                onClick={() => {
                  setStep('signup');
                  setFullName("");
                  setEmail("");
                  setPassword("");
                  setVerificationCode("");
                  setMessage(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
              >
                Create Another Account
              </button>

              <div className="mt-4">
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Back to login</Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Email</h2>
              <p className="text-gray-600">Check your inbox for the verification code</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">We sent a verification code to <span className="font-semibold">{email}</span></p>
            </div>
            
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Verification Code</label>
              <input 
                type="text"
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())} 
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 text-center text-xl tracking-widest font-semibold transition" 
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              onClick={() => setStep('signup')}
              disabled={loading}
              className="w-full mt-3 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 transition-all font-semibold"
            >
              Back
            </button>
          </>
        )}

        {message && (
          <div className={`mt-6 p-4 rounded-lg text-sm font-medium ${
            messageType === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
