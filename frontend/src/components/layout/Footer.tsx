export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 SavoryByte SaaS. All rights reserved.</p>
        <div className="flex space-x-6">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-400 cursor-pointer">API Documentation</span>
        </div>
      </div>
    </footer>
  );
}
