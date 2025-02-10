import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-red-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* University Info */}
        <div>
          <h2 className="font-bold text-lg mb-4">University of Sri Jayewardenepura</h2>
          <p>Gangodawila, Nugegoda, Sri Lanka.</p>
          <div className="mt-2">
            <p>+94 11 2758000,</p>
            <p>+94 11 2802022,</p>
          </div>
        </div>

        {/* Institutes and Centers */}
        <div>
          <h2 className="font-bold text-lg mb-4">Institutes and Centers</h2>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:underline">Postgraduate institute of Management</Link></li>
            <li><Link href="#" className="hover:underline">International Affairs Division</Link></li>
            <li><Link href="#" className="hover:underline">Social Reconciliation Centre</Link></li>
            <li><Link href="#" className="hover:underline">Career Guidance Unit</Link></li>
            <li><Link href="#" className="hover:underline">Centre for IT Services - CITS</Link></li>
          </ul>
        </div>

        {/* Symposia and Conferences */}
        <div>
          <h2 className="font-bold text-lg mb-4">Symposia and Conferences</h2>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:underline">ICBM - Business Management</Link></li>
            <li><Link href="#" className="hover:underline">IUPST - Polymer Science & Technology</Link></li>
            <li><Link href="#" className="hover:underline">ICMA - Multidisciplinary Approaches</Link></li>
            <li><Link href="#" className="hover:underline">IRCHSS -Humanities and Social Sciences</Link></li>
            <li><Link href="#" className="hover:underline">Forestry and Environment Symposium</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-red-700">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-center">
          Copyright All Right Reserved 2023, University of Sri Jayewardenepura, Sri Lanka. Powered by{' '}
          <Link href="#" className="hover:underline">Japura Web Team</Link>
        </div>
      </div>
    </footer>
  );
}