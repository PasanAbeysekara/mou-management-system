import Link from 'next/link';

export default function SubmissionSuccess() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <h1 className="text-2xl font-bold mb-6">
        Thank you for submitting your MOU. Here's what to expect next:
      </h1>
      <div className="space-y-4 text-left mb-8">
        <p>1. Review Process: Our team will review your submission within 3 working days.</p>
        <p>2. Feedback: You will receive feedback via email once the review is complete.</p>
        <p>3. Contact Information: For inquiries, please contact support@university.edu.</p>
      </div>
      <p className="mb-6">Please check your email for a confirmation of your submission.</p>

      <Link
        href="/"
        className="inline-flex items-center bg-red-700 text-white px-6 py-3 rounded-md hover:bg-red-800 mr-4"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
