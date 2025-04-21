import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-red-800 text-white">
      <div className="max-w-7xl mx-28 px-4 py-6 flex flex-row justify-between ">
        {/* Contact Info */}
        <div>
          <h2 className="font-bold text-lg mb-2">Contact Us</h2>
          <p>University of Sri Jayewardenepura</p>
          <p>Gangodawila, Nugegoda, Sri Lanka</p>
          <p>Tel: +94 11 2758000</p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="font-bold text-lg mb-2">Quick Links</h2>
          <ul>
            <li>
              <Link
                href="https://www.sjp.ac.lk/international/"
                className="hover:underline"
              >
                International Affairs
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-red-700">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-center">
          © 2025 University of Sri Jayewardenepura
        </div>
      </div>
    </footer>
  );
}