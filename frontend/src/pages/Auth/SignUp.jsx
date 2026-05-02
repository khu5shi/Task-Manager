import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../../components/layouts/AuthLayout'
import { useAuth } from '../../hooks/useAuth'
import { uploadImage } from '../../utils/uploadImage'

const SignUp = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminInviteToken: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfileImageFile(file)
      setProfilePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      let profileImageUrl = ''

      if (profileImageFile) {
        const uploadResult = await uploadImage(profileImageFile)
        profileImageUrl = uploadResult.imageUrl || ''
      }

      const user = await register({
        name: formData.name,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        profileImageUrl,
        adminInviteToken: formData.adminInviteToken,
      })
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not create an account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to start assigning tasks, checking progress, and staying organized."
      alternateText="Already have an account?"
      alternateLink="/login"
      alternateLabel="Log in"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 pr-24 text-sm text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-pink-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 pr-24 text-sm text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                placeholder="Repeat your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-pink-600"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Profile image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-pink-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
          />
          {profilePreview && (
            <div className="mt-3 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <img src={profilePreview} alt="preview" className="h-14 w-14 rounded-2xl object-cover" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Selected image</p>
                <p className="text-xs text-slate-500">Choose a new file to replace it.</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Admin invite token (optional)</label>
          <input
            type="text"
            name="adminInviteToken"
            value={formData.adminInviteToken}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            placeholder="Enter invite token if you have one"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default SignUp
