import { Link } from 'react-router-dom'

const AuthLayout = ({ children, title, subtitle, alternateText, alternateLink, alternateLabel }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col justify-center rounded-[32px] border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-sm md:p-12">
        <div className="mb-10 flex flex-col gap-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-600">Task Manager</p>
          <h1 className="text-4xl font-semibold text-slate-900">{title}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-sm md:p-10">
          {children}
        </div>

        {alternateText && (
          <div className="mt-6 text-center text-sm text-slate-600">
            {alternateText}{' '}
            <Link to={alternateLink} className="font-semibold text-pink-600 hover:text-pink-700">
              {alternateLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthLayout
