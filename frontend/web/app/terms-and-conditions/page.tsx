import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-4xl py-12">
        {/* Back to Home button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            ← Back 
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center">
          Terms and Conditions
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing or using our platform, you agree to be bound by these
            Terms and Conditions, all applicable laws, and regulations. If you
            do not agree with any part of these terms, you are prohibited from
            using or accessing the services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            2. Description of Services
          </h2>
          <p className="text-muted-foreground mb-4">
            We provide a range of educational services designed to support
            flexible and personalized learning, including:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground">
            <li className="mb-2">
              <strong>Independent Learning:</strong> Self-paced, pre-recorded
              courses available anytime. Includes certification upon successful
              completion.
            </li>
            <li className="mb-2">
              <strong>Group Sessions:</strong> Scheduled live group classes led
              by instructors. Attendance and participation are required.
            </li>
            <li className="mb-2">
              <strong>One-on-One Tutoring:</strong> Personalized tutoring
              sessions arranged between the learner and the tutor based on
              mutual availability.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            3. User Responsibilities
          </h2>
          <p className="text-muted-foreground">
            Users are expected to provide accurate personal information,
            maintain the confidentiality of their account credentials, and
            comply with all platform guidelines, including behavior and content
            standards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Payment and Billing</h2>
          <p className="text-muted-foreground">
            All payments for courses and tutoring sessions must be made in full
            at the time of registration unless otherwise stated. Payment details
            are securely processed through our third-party payment provider.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. No Refund Policy</h2>
          <p className="text-muted-foreground">
            Due to the nature of our digital and time-based educational
            services, <strong>all payments are final and non-refundable</strong>
            . By enrolling in a course or booking a session, you acknowledge and
            agree that you will not be eligible for a refund under any
            circumstances, including non-attendance, cancellation, or
            dissatisfaction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            6. Intellectual Property
          </h2>
          <p className="text-muted-foreground">
            All course materials, content, and resources provided through the
            platform remain the intellectual property of the platform or its
            licensors. Users are not permitted to reproduce, share, or
            distribute materials without prior written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            7. Modifications to Terms
          </h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these Terms and Conditions at any
            time. Continued use of the platform after such changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms and Conditions, please
            contact our support team at{" "}
            <a
              href="mailto:Group5Capstone@example.com"
              className="underline text-blue-600"
            >
              Group5Capstone@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
