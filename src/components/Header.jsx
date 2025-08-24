export default function Header() {
  return (
    <header className="flex justify-between items-center bg-white px-6 py-4 border-b sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold">My Team &gt; Recognitions</h2>
        <p className="text-gray-500 text-sm">Keep track of your team’s goals</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            aria-label="Search employees or actions"
            type="text"
            placeholder="Search employees or actions..."
            className="border rounded-full pl-10 pr-3 py-2 text-sm w-72 bg-gray-50 focus:bg-white"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-sm">
          Set goals for each quarter
        </button>
      </div>
    </header>
  );
}
