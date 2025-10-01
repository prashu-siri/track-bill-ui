"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "../components/NavBar";
import styles from "./page.module.css";

type Bill = {
	id: number;
	date: string; // ISO date string
	type: string;
	amount: string;
	status: "paid" | "unpaid" | "pending"; // Ensure status is one of these
};

// --- Utility Functions ---

function groupBillsByMonth(bills: Bill[]) {
	const groups: { [month: string]: Bill[] } = {};
	bills.forEach((bill) => {
		// Determine the month and year string for grouping
		const month = new Date(bill.date).toLocaleString("default", {
			month: "long",
			year: "numeric",
		});
		// FIX: Corrected typo in array initialization
		if (!groups[month]) groups[month] = [];
		groups[month].push(bill);
	});
	return groups;
}

function getUniqueYears(bills: Bill[]) {
	const years = new Set<string>();
	bills.forEach((bill) => {
		const date = new Date(bill.date);
		years.add(date.getFullYear().toString());
	});
	return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Sort years descending
}

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

// --- Utility Components ---

// Format currency in Indian Rupees
const formatter = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	minimumFractionDigits: 2,
});

type BillCardProps = {
	bill: Bill;
	formatter: Intl.NumberFormat;
};

// Component for a single bill
const BillCard: React.FC<BillCardProps> = ({ bill, formatter }) => {
	const date = new Date(bill.date).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "2-digit",
	});

	const isPaid = bill.status === "paid";

	return (
		<div
			className={`${styles.billCard} ${
				isPaid ? styles.paidCard : styles.pendingCard
			}`}
		>
			<div className={styles.billCardHeader}>
				<span className={styles.billType}>{bill.type}</span>
				<span className={`${styles.status} ${styles[bill.status]}`}>
					{bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
				</span>
			</div>
			<div className={styles.billCardBody}>
				<div className={styles.billAmountDue}>
					{formatter.format(parseFloat(bill.amount))}
				</div>
				<div className={styles.billDueDate}>Due: {date}</div>
			</div>
		</div>
	);
};

type BillSummaryProps = {
	title: string;
	totalAmount: number;
	count: number;
	formatter: Intl.NumberFormat;
	type: "due" | "paid";
};

// Component for the top summary cards
const BillSummary: React.FC<BillSummaryProps> = ({
	title,
	totalAmount,
	count,
	formatter,
	type,
}) => (
	<div
		className={`${styles.summaryCard} ${
			type === "due" ? styles.dueCard : styles.paidCard
		}`}
	>
		<h2 className={styles.summaryTitle}>{title}</h2>
		<div className={styles.summaryAmount}>
			{formatter.format(totalAmount)}
		</div>
		<div className={styles.summaryCount}>
			{count} {type === "due" ? "Pending Bills" : "Bills Paid"}
		</div>
	</div>
);

type MonthSummaryCardProps = {
	month: string;
	bills: Bill[];
	formatter: Intl.NumberFormat;
};

// New Component: Card for the month's summary and background
const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({
	month,
	bills,
	formatter,
}) => {
	const totalMonthAmount = bills.reduce(
		(sum, bill) => sum + parseFloat(bill.amount),
		0
	);

	return (
		<div className={styles.monthCard}>
			<div className={styles.monthHeader}>
				<h2 className={styles.monthTitle}>{month} Bills</h2>
				<div className={styles.monthTotal}>
					<span className={styles.monthTotalLabel}>Month Total:</span>
					<span className={styles.monthTotalAmount}>
						{formatter.format(totalMonthAmount)}
					</span>
				</div>
			</div>

			<div className={styles.billsGrid}>
				{/* Sort bills within the month by date ascending */}
				{bills
					.sort(
						(a, b) =>
							new Date(a.date).getTime() -
							new Date(b.date).getTime()
					)
					.map((bill) => (
						<BillCard
							key={bill.id}
							bill={bill}
							formatter={formatter}
						/>
					))}
			</div>
		</div>
	);
};

// --- Main Home Component ---

export default function Home() {
	const [bills, setBills] = useState<Bill[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedMonth, setSelectedMonth] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<string>("");

	const mockData: Bill[] = [
		{
			id: 1,
			date: "2025-10-02",
			status: "pending",
			type: "Gold Loan Interest",
			amount: "180557.00",
		},
		{
			id: 2,
			date: "2025-10-02",
			status: "paid",
			type: "SIP Payment",
			amount: "7057.00",
		},
		{
			id: 3,
			date: "2025-09-03",
			status: "paid",
			type: "Amazon Credit Card",
			amount: "3919.00",
		},
		{
			id: 4,
			date: "2025-09-01",
			status: "paid",
			type: "ICICI Credit Card",
			amount: "31627.85",
		},
		{
			id: 5,
			date: "2025-10-15",
			status: "unpaid",
			type: "LIC Premium",
			amount: "37055.82",
		},
		{
			id: 6,
			date: "2025-10-25",
			status: "pending",
			type: "Electricity Bill",
			amount: "1200.00",
		},
		{
			id: 7,
			date: "2025-09-20",
			status: "paid",
			type: "Water Bill",
			amount: "550.00",
		},
	];

	useEffect(() => {
		// setBills(mockData);
		// setLoading(false);
		fetch("https://track-bill-api.onrender.com/api/bills")
			.then((res) => res.json())
			.then((data) => {
				setBills(data);
				setLoading(false);
			});
	}, []);

	const years = getUniqueYears(bills);

	// Filter bills by selected month and year
	const filteredBills = useMemo(() => {
		return bills.filter((bill) => {
			const date = new Date(bill.date);
			const monthMatch =
				!selectedMonth ||
				date.toLocaleString("default", { month: "long" }) ===
					selectedMonth;
			const yearMatch =
				!selectedYear || date.getFullYear().toString() === selectedYear;
			return monthMatch && yearMatch;
		});
	}, [bills, selectedMonth, selectedYear]);

	// Group bills by month for display
	const groupedBills = groupBillsByMonth(filteredBills);

	// Calculations for Summary Cards
	const pendingBills = filteredBills.filter((bill) => bill.status !== "paid");
	const paidBills = filteredBills.filter((bill) => bill.status === "paid");

	const totalDue = pendingBills.reduce(
		(sum, bill) => sum + parseFloat(bill.amount),
		0
	);
	const totalPaid = paidBills.reduce(
		(sum, bill) => sum + parseFloat(bill.amount),
		0
	);
	const totalOverall = totalDue + totalPaid;

	// Sort months so most recent is first (FIXED LOGIC)
	const sortedMonths = Object.keys(groupedBills).sort((a, b) => {
		// Standardize month strings for reliable Date comparison (e.g., "October 2025" -> "1 October, 2025")
		const dateA = new Date(a.replace(/(\w+)\s(\d+)/, "1 $1, $2")).getTime();
		const dateB = new Date(b.replace(/(\w+)\s(\d+)/, "1 $1, $2")).getTime();
		return dateB - dateA;
	});

	return (
		<div className={styles.page}>
			<NavBar
				rightLinks={[
					{ href: "/add-bill", label: "Add Bill" },
					{ href: "/manage-bills", label: "Manage Bills" },
				]}
			/>
			<main className={styles.main}>
				<h1 className={styles.dashboardTitle}>Bills Dashboard</h1>
				<div className={styles.filters}>
					<select
						value={selectedMonth}
						onChange={(e) => setSelectedMonth(e.target.value)}
						className={styles.filterSelect}
					>
						<option value="">All Months</option>
						{MONTHS.map((month) => (
							<option key={month} value={month}>
								{month}
							</option>
						))}
					</select>
					<select
						value={selectedYear}
						onChange={(e) => setSelectedYear(e.target.value)}
						className={styles.filterSelect}
					>
						<option value="">All Years</option>
						{years.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
				{loading ? (
					<div>Loading...</div>
				) : (
					<div className={styles.dashboard}>
						{/* 1. Summary Cards for the entire filtered view */}
						<div className={styles.summaryContainer}>
							<BillSummary
								title="Total Due"
								totalAmount={totalDue}
								count={pendingBills.length}
								formatter={formatter}
								type="due"
							/>
							<BillSummary
								title="Total Paid"
								totalAmount={totalPaid}
								count={paidBills.length}
								formatter={formatter}
								type="paid"
							/>
						</div>

						{/* 2. Month-wise Sections with backgrounds and totals */}
						{sortedMonths.length > 0 ? (
							// Use sortedMonths array for iteration
							sortedMonths.map((month) => (
								<MonthSummaryCard
									key={month}
									month={month}
									bills={groupedBills[month]}
									formatter={formatter}
								/>
							))
						) : (
							<div className={styles.noBillsContainer}>
								<p className={styles.noBills}>
									No bills found for the selected filter(s).
								</p>
							</div>
						)}

						{/* 3. Overall Total (Kept at the bottom for final summary) */}
						<div className={styles.overallTotal}>
							<span className={styles.overallTotalLabel}>
								Overall Total Spent/Due (
								{selectedMonth || "All"}{" "}
								{selectedYear || "Years"})
							</span>
							<span className={styles.overallTotalAmount}>
								{formatter.format(totalOverall)}
							</span>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
