export default function SupportTicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Support Ticket Management</h2>
          <p className="text-muted-foreground">
            Manage customer support tickets, responses, and resolution tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
