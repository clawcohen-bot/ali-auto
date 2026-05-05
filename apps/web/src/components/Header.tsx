export default function Header() {
  return (
    <header
      className="w-full py-4 px-6 shadow-md"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="text-3xl">🚗</span>
        <div>
          <h1 className="text-white text-2xl font-bold leading-tight tracking-wide">
            Ali Auto
          </h1>
          <p className="text-gray-400 text-sm">אביזרי רכב מ-AliExpress</p>
        </div>
      </div>
    </header>
  );
}
