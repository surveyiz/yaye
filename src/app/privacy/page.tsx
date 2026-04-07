export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-headline text-3xl font-bold text-primary mb-8">Privacy Policy</h1>
      <div className="prose prose-blue max-w-none space-y-6 text-muted-foreground">
        <p>
          As part of any recruitment process, Canada Pathway Jobs collects and processes personal data relating to job applicants. We are committed to being transparent about how we collect and use that data and to meeting our data protection obligations.
        </p>
        <h2 className="text-xl font-bold text-primary mt-8">Data Collection</h2>
        <p>
          The information provided during the application process is safe and used solely for the purpose of recruitment. This includes your name, contact details, identification numbers, and educational history.
        </p>
        <h2 className="text-xl font-bold text-primary mt-8">Payment Verification</h2>
        <p>
          M-Pesa transaction codes are used strictly for payment verification of the mandatory registration fee. Unverified or missing payments will result in the application not being considered.
        </p>
        <h2 className="text-xl font-bold text-primary mt-8">Your Rights</h2>
        <p>
          Applicants have the right to request access to their data or request its deletion if they decide to withdraw their application.
        </p>
      </div>
    </div>
  );
}