export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          1. Information Collection
        </h2>
        <p className="text-muted-foreground">
          We collect personal information when you register for our services...
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Data Usage</h2>
        <p className="text-muted-foreground">
          Your data is used to provide and improve our educational services...
        </p>
      </section>

      {/* Add more sections as needed */}
    </div>
  );
}
