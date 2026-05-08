import type { MonthlyRevenue, ChannelMargin, CashForecast, InventoryAging, MarketplaceHold, ARItem, APItem, TaxItem, PayrollItem, Alert } from '../types'

export const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Apr 25', revenue: 720000, grossMargin: 32.1, netMargin: 8.4 },
  { month: 'May 25', revenue: 785000, grossMargin: 33.2, netMargin: 9.1 },
  { month: 'Jun 25', revenue: 810000, grossMargin: 34.0, netMargin: 9.8 },
  { month: 'Jul 25', revenue: 760000, grossMargin: 31.5, netMargin: 7.9 },
  { month: 'Aug 25', revenue: 690000, grossMargin: 30.2, netMargin: 6.8 },
  { month: 'Sep 25', revenue: 870000, grossMargin: 34.5, netMargin: 10.2 },
  { month: 'Oct 25', revenue: 940000, grossMargin: 35.1, netMargin: 11.0 },
  { month: 'Nov 25', revenue: 1120000, grossMargin: 36.8, netMargin: 12.5 },
  { month: 'Dec 25', revenue: 1280000, grossMargin: 37.2, netMargin: 13.1 },
  { month: 'Jan 26', revenue: 820000, grossMargin: 33.8, netMargin: 9.5 },
  { month: 'Feb 26', revenue: 790000, grossMargin: 32.9, netMargin: 8.8 },
  { month: 'Mar 26', revenue: 845000, grossMargin: 34.2, netMargin: 10.1 },
]

export const channelMargins: ChannelMargin[] = [
  { channel: 'Back Market', revenue: 2840000, margin: 980000, marginPct: 34.5, units: 4200 },
  { channel: 'Refurbed', revenue: 1920000, margin: 672000, marginPct: 35.0, units: 2800 },
  { channel: 'B2B Direct', revenue: 2100000, margin: 588000, marginPct: 28.0, units: 3100 },
  { channel: 'Shopify', revenue: 1450000, margin: 580000, marginPct: 40.0, units: 2100 },
  { channel: 'Amazon', revenue: 890000, margin: 267000, marginPct: 30.0, units: 1300 },
  { channel: 'eBay', revenue: 420000, margin: 130200, marginPct: 31.0, units: 620 },
]

export const cashForecast: CashForecast[] = [
  { week: 'W1 Mar', balance: 185000 },
  { week: 'W2 Mar', balance: 172000 },
  { week: 'W3 Mar', balance: 195000 },
  { week: 'W4 Mar', balance: 168000, forecast: 168000 },
  { week: 'W1 Apr', forecast: 145000 },
  { week: 'W2 Apr', forecast: 128000 },
  { week: 'W3 Apr', forecast: 142000 },
  { week: 'W4 Apr', forecast: 119000 },
  { week: 'W1 May', forecast: 98000 },
  { week: 'W2 May', forecast: 87000 },
  { week: 'W3 May', forecast: 95000 },
  { week: 'W4 May', forecast: 112000 },
  { week: 'W1 Jun', forecast: 105000 },
]

export const inventoryAging: InventoryAging[] = [
  { range: '0–30 days', value: 320000, units: 1850 },
  { range: '31–60 days', value: 185000, units: 920 },
  { range: '61–90 days', value: 95000, units: 480 },
  { range: '90+ days', value: 20000, units: 110 },
]

export const marketplaceHolds: MarketplaceHold[] = [
  { marketplace: 'Back Market', amount: 14500, agingDays: 18, status: 'Dispute in progress' },
  { marketplace: 'Refurbed', amount: 8200, agingDays: 12, status: 'Monthly payout pending' },
  { marketplace: 'Amazon', amount: 3100, agingDays: 25, status: 'A-to-Z claim review' },
  { marketplace: 'eBay', amount: 2800, agingDays: 8, status: 'Reserve hold' },
  { marketplace: 'Allegro', amount: 9600, agingDays: 15, status: 'Payout cycle' },
  { marketplace: 'FNAC', amount: 7000, agingDays: 22, status: 'Dispute escalated' },
]

export const arItems: ARItem[] = [
  { customer: 'TechResale GmbH', invoiceNo: 'INV-2026-0142', amount: 24500, dueDate: '2026-02-15', agingDays: 40, status: 'critical' },
  { customer: 'Mobiltek B.V.', invoiceNo: 'INV-2026-0138', amount: 18200, dueDate: '2026-02-28', agingDays: 27, status: 'overdue' },
  { customer: 'PhoneWorld Ltd', invoiceNo: 'INV-2026-0151', amount: 9800, dueDate: '2026-03-10', agingDays: 17, status: 'overdue' },
  { customer: 'ElectroHub SA', invoiceNo: 'INV-2026-0158', amount: 32100, dueDate: '2026-03-20', agingDays: 7, status: 'current' },
  { customer: 'DigiTrade FZCO', invoiceNo: 'INV-2026-0162', amount: 15600, dueDate: '2026-03-25', agingDays: 2, status: 'current' },
  { customer: 'Refurb Pro SRL', invoiceNo: 'INV-2026-0167', amount: 8900, dueDate: '2026-04-05', agingDays: -9, status: 'current' },
]

export const apItems: APItem[] = [
  { supplier: 'Apple Trade-In Partner DE', invoiceNo: 'SUP-2026-0891', amount: 38500, dueDate: '2026-03-28', agingDays: 1 },
  { supplier: 'iGreen Sourcing UK', invoiceNo: 'SUP-2026-0876', amount: 22000, dueDate: '2026-03-30', agingDays: 3 },
  { supplier: 'Foxconn Refurb HK', invoiceNo: 'SUP-2026-0854', amount: 61200, dueDate: '2026-04-05', agingDays: 9 },
  { supplier: 'Warsaw Warehouse SCC', invoiceNo: 'SUP-2026-0841', amount: 8400, dueDate: '2026-04-08', agingDays: 12 },
  { supplier: 'DHL Supply Chain PL', invoiceNo: 'SUP-2026-0912', amount: 4200, dueDate: '2026-04-10', agingDays: 14 },
]

export const taxItems: TaxItem[] = [
  { type: 'VAT Poland (PL)', period: 'Feb 2026', amount: 28400, dueDate: '2026-03-25', status: 'pending' },
  { type: 'OSS EU', period: 'Q1 2026', amount: 14200, dueDate: '2026-04-30', status: 'pending' },
  { type: 'CIT Advance', period: 'Mar 2026', amount: 9800, dueDate: '2026-03-20', status: 'paid' },
  { type: 'VAT Poland (PL)', period: 'Jan 2026', amount: 31200, dueDate: '2026-02-25', status: 'paid' },
  { type: 'ZUS (Employer)', period: 'Feb 2026', amount: 18600, dueDate: '2026-03-15', status: 'paid' },
  { type: 'OSS EU', period: 'Q4 2025', amount: 12800, dueDate: '2026-01-31', status: 'paid' },
]

export const payrollItems: PayrollItem[] = [
  { employee: 'Marek Kowalski', role: 'Operations Manager', grossSalary: 12000, zusCost: 2172, netPay: 8640, month: 'Mar 2026' },
  { employee: 'Anna Wiśniewska', role: 'Finance Controller', grossSalary: 10500, zusCost: 1901, netPay: 7560, month: 'Mar 2026' },
  { employee: 'Piotr Nowak', role: 'Warehouse Lead', grossSalary: 7500, zusCost: 1358, netPay: 5400, month: 'Mar 2026' },
  { employee: 'Katarzyna Zając', role: 'Customer Support', grossSalary: 6000, zusCost: 1086, netPay: 4320, month: 'Mar 2026' },
  { employee: 'Tomasz Lewandowski', role: 'Logistics Coordinator', grossSalary: 8000, zusCost: 1449, netPay: 5760, month: 'Mar 2026' },
  { employee: 'Magdalena Dąbrowska', role: 'QC Specialist', grossSalary: 6500, zusCost: 1177, netPay: 4680, month: 'Mar 2026' },
  { employee: 'Rafał Szymański', role: 'IT/Dev', grossSalary: 13000, zusCost: 2354, netPay: 9360, month: 'Mar 2026' },
  { employee: 'Joanna Wójcik', role: 'Marketplace Manager', grossSalary: 9000, zusCost: 1630, netPay: 6480, month: 'Mar 2026' },
]

export const alerts: Alert[] = [
  { id: '1', severity: 'RED', issueType: 'Overdue AR', counterparty: 'TechResale GmbH', amount: 24500, agingDays: 40, owner: 'Finance Team', nextAction: 'Send final demand letter + legal notice' },
  { id: '2', severity: 'RED', issueType: 'AR Overdue', counterparty: 'Mobiltek B.V.', amount: 18200, agingDays: 27, owner: 'Finance Team', nextAction: 'Call CFO today, escalate to CEO if no response' },
  { id: '3', severity: 'RED', issueType: 'Marketplace Dispute', counterparty: 'Back Market', amount: 14500, agingDays: 18, owner: 'Marketplace Manager', nextAction: 'Submit dispute documentation by EOD' },
  { id: '4', severity: 'RED', issueType: 'Shipping Claim', counterparty: 'DHL / FedEx', amount: 2500, agingDays: 35, owner: 'Logistics', nextAction: 'Escalate claim — 30-day threshold exceeded' },
  { id: '5', severity: 'AMBER', issueType: 'Marketplace Hold', counterparty: 'FNAC', amount: 7000, agingDays: 22, owner: 'Marketplace Manager', nextAction: 'Submit missing invoice to release payment' },
  { id: '6', severity: 'AMBER', issueType: 'Marketplace Hold', counterparty: 'Allegro', amount: 9600, agingDays: 15, owner: 'Marketplace Manager', nextAction: 'Confirm payout cycle, escalate if delayed' },
  { id: '7', severity: 'AMBER', issueType: 'Aged Inventory', counterparty: 'Internal', amount: 20000, agingDays: 95, owner: 'Warehouse Lead', nextAction: 'Price reduce by 12% and push to B2B channel' },
  { id: '8', severity: 'AMBER', issueType: 'Goods in Transit', counterparty: 'Foxconn Refurb HK', amount: 25000, agingDays: 14, owner: 'Operations Manager', nextAction: 'Confirm customs clearance ETA' },
  { id: '9', severity: 'GREEN', issueType: 'AP Due', counterparty: 'Apple Trade-In Partner DE', amount: 38500, agingDays: 1, owner: 'Finance Team', nextAction: 'Schedule payment for tomorrow' },
  { id: '10', severity: 'GREEN', issueType: 'Tax Due', counterparty: 'Polish Tax Authority', amount: 28400, agingDays: -2, owner: 'Finance Controller', nextAction: 'File VAT return by March 25' },
]

export const moneyStuckBreakdown = [
  { month: 'Nov 25', arOverdue: 5200, holds: 38000, claims: 1800, agedInventory: 16000, transit: 18000 },
  { month: 'Dec 25', arOverdue: 6800, holds: 42000, claims: 2100, agedInventory: 17500, transit: 22000 },
  { month: 'Jan 26', arOverdue: 9200, holds: 39000, claims: 2800, agedInventory: 19000, transit: 24000 },
  { month: 'Feb 26', arOverdue: 7500, holds: 44000, claims: 2200, agedInventory: 20500, transit: 26000 },
  { month: 'Mar 26', arOverdue: 8300, holds: 45200, claims: 2500, agedInventory: 20000, transit: 25000 },
]

export const revenueByCategory = [
  { category: 'iPhone 13 Series', revenue: 2840000, units: 4200, margin: 34.2 },
  { category: 'iPhone 14 Series', revenue: 2120000, units: 2800, margin: 36.1 },
  { category: 'iPhone 12 Series', revenue: 1480000, units: 2600, margin: 28.4 },
  { category: 'MacBook Pro/Air', revenue: 1240000, units: 620, margin: 22.5 },
  { category: 'iPad Series', revenue: 890000, units: 1100, margin: 30.2 },
  { category: 'AirPods/Watch', revenue: 650000, units: 2800, margin: 38.5 },
  { category: 'Samsung Galaxy', revenue: 420000, units: 850, margin: 24.1 },
]

export const unitsSoldByChannel = [
  { month: 'Oct 25', backMarket: 420, refurbed: 280, b2b: 310, shopify: 210, amazon: 130 },
  { month: 'Nov 25', backMarket: 520, refurbed: 340, b2b: 380, shopify: 260, amazon: 160 },
  { month: 'Dec 25', backMarket: 680, refurbed: 420, b2b: 450, shopify: 320, amazon: 200 },
  { month: 'Jan 26', backMarket: 380, refurbed: 260, b2b: 290, shopify: 190, amazon: 120 },
  { month: 'Feb 26', backMarket: 360, refurbed: 240, b2b: 270, shopify: 180, amazon: 110 },
  { month: 'Mar 26', backMarket: 390, refurbed: 255, b2b: 285, shopify: 192, amazon: 118 },
]
