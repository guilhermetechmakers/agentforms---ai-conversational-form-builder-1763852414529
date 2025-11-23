import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Loader2 } from "lucide-react"
import { useInvoices, useDownloadInvoice } from "@/hooks/useBilling"
import { format } from "date-fns"

const statusColors = {
  draft: "bg-[#A1A1AA]",
  sent: "bg-[#60A5FA]",
  paid: "bg-[#4ADE80]",
  overdue: "bg-[#F87171]",
  canceled: "bg-[#6B7280]",
  refunded: "bg-[#FBBF24]",
}

export function BillingInvoices() {
  const { data: invoices, isLoading } = useInvoices()
  const downloadInvoice = useDownloadInvoice()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#303136] bg-[#282A30]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#F3F4F6]">
            <FileText className="h-5 w-5 text-[#F6D365]" />
            Invoices
          </CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            View and download your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#303136] hover:bg-[#24262C]">
                    <TableHead className="text-[#A1A1AA]">Invoice #</TableHead>
                    <TableHead className="text-[#A1A1AA]">Date</TableHead>
                    <TableHead className="text-[#A1A1AA]">Due Date</TableHead>
                    <TableHead className="text-[#A1A1AA]">Amount</TableHead>
                    <TableHead className="text-[#A1A1AA]">Status</TableHead>
                    <TableHead className="text-[#A1A1AA] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="border-[#303136] hover:bg-[#24262C]"
                    >
                      <TableCell className="font-medium text-[#F3F4F6]">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell className="text-[#A1A1AA]">
                        {format(new Date(invoice.invoice_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-[#A1A1AA]">
                        {invoice.due_date
                          ? format(new Date(invoice.due_date), "MMM dd, yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-[#F3F4F6] font-semibold">
                        ${invoice.total_amount.toFixed(2)} {invoice.currency}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColors[invoice.status]} text-white capitalize`}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadInvoice.mutate(invoice.id)}
                          disabled={downloadInvoice.isPending}
                          className="text-[#60A5FA] hover:text-[#60A5FA]/80 hover:bg-[#24262C]"
                        >
                          {downloadInvoice.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
              <p className="text-[#A1A1AA] mb-2">No invoices found</p>
              <p className="text-sm text-[#6B7280]">
                Invoices will appear here once you have billing activity
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
