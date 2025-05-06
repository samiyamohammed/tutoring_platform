"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, CreditCard, DollarSign, Download, Filter, Wallet, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const withdrawFormSchema = z.object({
  amount: z.coerce.number().min(10, { message: "Minimum withdrawal amount is $10" }),
  paymentMethod: z.string().min(1, { message: "Please select a payment method" }),
})

type WithdrawFormValues = z.infer<typeof withdrawFormSchema>

// Mock data for earnings
const mockEarnings = {
  totalEarnings: 3250.75,
  availableBalance: 1250.5,
  pendingPayments: 450.25,
  lifetimeEarnings: 5750.0,
  recentTransactions: [
    {
      id: "1",
      date: "2023-05-15",
      type: "course_purchase",
      description: "Course purchase: Advanced JavaScript Programming",
      amount: 199.99,
      status: "completed",
    },
    {
      id: "2",
      date: "2023-05-10",
      type: "one_on_one",
      description: "One-on-one session with Jane Doe",
      amount: 75.0,
      status: "completed",
    },
    {
      id: "3",
      date: "2023-05-05",
      type: "group_session",
      description: "Group session: UI/UX Design Workshop",
      amount: 350.0,
      status: "completed",
    },
    {
      id: "4",
      date: "2023-05-01",
      type: "withdrawal",
      description: "Withdrawal to bank account",
      amount: -500.0,
      status: "completed",
    },
    {
      id: "5",
      date: "2023-04-28",
      type: "course_purchase",
      description: "Course purchase: Machine Learning Fundamentals",
      amount: 249.99,
      status: "completed",
    },
    {
      id: "6",
      date: "2023-04-20",
      type: "one_on_one",
      description: "One-on-one session with John Smith",
      amount: 75.0,
      status: "pending",
    },
  ],
  paymentMethods: [
    { id: "1", type: "bank_account", name: "Bank Account", last4: "4567" },
    { id: "2", type: "paypal", name: "PayPal", email: "tutor@example.com" },
  ],
}

export default function TutorEarningsPage() {
  const { toast } = useToast()
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [transactionType, setTransactionType] = useState("all")

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawFormSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "",
    },
  })

  const filteredTransactions = mockEarnings.recentTransactions.filter((transaction) => {
    let matchesType = true
    let matchesDate = true

    if (transactionType !== "all") {
      matchesType = transaction.type === transactionType
    }

    if (dateRange.from) {
      const transactionDate = new Date(transaction.date)
      matchesDate = transactionDate >= dateRange.from

      if (dateRange.to) {
        matchesDate = matchesDate && transactionDate <= dateRange.to
      }
    }

    return matchesType && matchesDate
  })

  async function onSubmitWithdraw(values: WithdrawFormValues) {
    setIsSubmitting(true)

    try {
      // This would be replaced with actual API call
      console.log(values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Withdrawal requested",
        description: `$${values.amount.toFixed(2)} withdrawal has been initiated.`,
      })

      setIsWithdrawDialogOpen(false)
      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Earnings & Payments</h1>
              <p className="text-sm text-muted-foreground">Manage your earnings and payment methods</p>
            </div>
            <Button onClick={() => setIsWithdrawDialogOpen(true)}>
              <Wallet className="mr-2 h-4 w-4" />
              Withdraw Funds
            </Button>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockEarnings.availableBalance.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Available for withdrawal</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockEarnings.pendingPayments.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Payments being processed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockEarnings.totalEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Total earnings this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mockEarnings.lifetimeEarnings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Total earnings since joining</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="transactions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="payment_methods">Payment Methods</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>View your recent transactions and earnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                      <div className="flex items-center space-x-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="date"
                              variant={"outline"}
                              className="w-[300px] justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? (
                                dateRange.to ? (
                                  <>
                                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(dateRange.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={new Date()}
                              selected={{ from: dateRange.from, to: dateRange.to }}
                              onSelect={(range) => setDateRange({ from: range?.from || undefined, to: range?.to || undefined })}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select value={transactionType} onValueChange={setTransactionType}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Transactions</SelectItem>
                            <SelectItem value="course_purchase">Course Purchases</SelectItem>
                            <SelectItem value="one_on_one">One-on-One Sessions</SelectItem>
                            <SelectItem value="group_session">Group Sessions</SelectItem>
                            <SelectItem value="withdrawal">Withdrawals</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setDateRange({ from: undefined, to: undefined })
                            setTransactionType("all")
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
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                No transactions found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell className="font-medium">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                      transaction.status === "completed"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-yellow-50 text-yellow-700",
                                    )}
                                  >
                                    {transaction.status === "completed" ? "Completed" : "Pending"}
                                  </span>
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-right font-medium",
                                    transaction.amount < 0 ? "text-destructive" : "text-green-600",
                                  )}
                                >
                                  {transaction.amount < 0 ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="payment_methods">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods for withdrawals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockEarnings.paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center space-x-4">
                            {method.type === "bank_account" ? (
                              <CreditCard className="h-8 w-8 text-primary" />
                            ) : (
                              <Wallet className="h-8 w-8 text-primary" />
                            )}
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {method.type === "bank_account" ? `Ending in ${method.last4}` : method.email}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>Withdraw your available balance to your preferred payment method.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitWithdraw)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (USD)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          min={10}
                          max={mockEarnings.availableBalance}
                          step={0.01}
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Available balance: ${mockEarnings.availableBalance.toFixed(2)}
                    </p>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockEarnings.paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name} ({method.type === "bank_account" ? `ending in ${method.last4}` : method.email}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsWithdrawDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Withdraw Funds"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
