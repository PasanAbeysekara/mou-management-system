import Link from 'next/link';

export default function MOUSubmission() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Submit Your MOU Today</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl">
        Ensure your agreements are up to date. Submit your Memorandum of Understanding documents to stay
        compliant and organized.
      </p>
      <Link 
        href="/mou-submission/form"
        className="bg-red-700 text-white px-6 py-3 rounded-md hover:bg-red-800 transition-colors"
      >
        Submit Now
      </Link>
    </div>
  );
}