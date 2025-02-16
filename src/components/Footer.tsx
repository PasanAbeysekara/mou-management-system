import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-red-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* University Info */}
        <div>
          <h2 className="font-bold text-lg mb-4">
            University of Sri Jayewardenepura
          </h2>
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
            <li>
              <Link
                href="https://www.sjp.ac.lk/international/"
                className="hover:underline"
              >
                International Affairs Division
              </Link>
            </li>
          </ul>
        </div>

        {/* Location */}
        <div>
          <h2 className="font-bold text-lg mb-4">Location</h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.3152256557387!2d79.89882099678958!3d6.852767000000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25a8936886579%3A0xa8c769f4b86d85b5!2sUniversity%20of%20Sri%20Jayewardenepura!5e0!3m2!1sen!2slk!4v1739712590485!5m2!1sen!2slk"
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="University Location"
          ></iframe>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-red-700">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-center">
          Copyright All Right Reserved 2023, University of Sri Jayewardenepura,
          Sri Lanka. Powered by{" "}
          <Link href="#" className="hover:underline">
            Japura Web Team
          </Link>
        </div>
      </div>
    </footer>
  );
}
