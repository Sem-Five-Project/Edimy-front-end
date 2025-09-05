export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ratings & Reviews</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Review Moderation</h2>
          <p className="text-muted-foreground">
            Monitor and moderate tutor ratings and student reviews.
          </p>
        </div>
      </div>
    </div>
  );
}
