import { useNavigate } from 'react-router'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <p className="text-6xl">{'\ud83d\ude35'}</p>
      <h1 className="mt-4 text-xl font-bold text-gray-700">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        URL yang kamu tuju tidak ada.
      </p>
      <button
        type="button"
        onClick={() => void navigate('/')}
        className="mt-6 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition-all active:scale-95"
      >
        {'\ud83c\udfe0'} Kembali ke Home
      </button>
    </div>
  )
}
