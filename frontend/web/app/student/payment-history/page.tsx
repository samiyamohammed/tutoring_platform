"use client"

import { useState } from "react"
import { Download, Filter, Receipt, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Mock payment data
const mockPayments = [
  {
    id: "PAY-001",
    date: "2023-05-15",
    amount: 199.99,
    method: "Credit Card",
    status: "completed",
    description: "Advanced JavaScript Programming",
  },
  {
    id: "PAY-002",
    date: "2023-04-20",
    amount: 149.99,
    method: "Telebirr",
    status: "completed",
    description: "UI/UX Design Fundamentals",
  },
  {
    id: "PAY-003",
    date: "2023-03-10",
    amount: 249.99,
    method: "Bank Transfer",
    status: "completed",
    description: "Data Science with Python",
  },
  {
    id: "PAY-004",
    date: "2023-02-28",
    amount: 99.99,
    method: "Credit Card",
    status: "refunded",
    description: "Introduction to Digital Marketing",
  },
  {
    id: "PAY-005",
    date: "2023-01-15",
    amount: 79.99,
    method: "Telebirr",
    status: "failed",
    description: "Mobile App Development with React Native",
  },
]

export default function PaymentHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Payment History</h1>
              <p className="text-sm text-muted-foreground">View and manage your payment transactions</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="flex-1 p-8 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>View all your payment transactions and receipts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                      }}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No transactions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.id}</TableCell>
                            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                            <TableCell>{payment.description}</TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  payment.status === "completed"
                                    ? "default"
                                    : payment.status === "pending"
                                      ? "outline"
                                      : payment.status === "refunded"
                                        ? "secondary"
                                        : "destructive"
                                }
                              >
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Receipt className="h-4 w-4" />
                                <span className="sr-only">View Receipt</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
