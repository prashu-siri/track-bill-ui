"use client";

import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import styles from "./page.module.css";

type Bill = {
	id: number;
	date: string; // ISO date string
	type: string;
	amount: string;
	status: string;
};

function groupBillsByMonth(bills: Bill[]) {
	const groups: { [month: string]: Bill[] } = {};
	bills.forEach((bill) => {
		const month = new Date(bill.date).toLocaleString("default", {
			month: "long",
			year: "numeric",
		});
		if (!groups[month]) groups[month] = [];
		groups[month].push(bill);
	});
	return groups;
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

function getUniqueYears(bills: Bill[]) {
	const years = new Set<string>();
	bills.forEach((bill) => {
		const date = new Date(bill.date);
		years.add(date.getFullYear().toString());
	});
	return Array.from(years);
}

export default function Home() {
	const [bills, setBills] = useState<Bill[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedMonth, setSelectedMonth] = useState<string>("");
	const [selectedYear, setSelectedYear] = useState<string>("");

	const mockData: Bill[] = [
		{
			id: 3,
			date: "2025-09-03",
			status: "paid",
			type: "Amazon Credit Card",
			amount: "3919",
		},
		{
			id: 4,
			date: "2025-09-01",
			status: "paid",
			type: "ICICI credit card",
			amount: "31627.85",
		},
		{
			id: 5,
			date: "2025-01-05",
			status: "paid",
			type: "Electricity ",
			amount: "84",
		},
	];

	useEffect(() => {
		// Replace with your actual API endpoint
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
	const filteredBills = bills.filter((bill) => {
		const date = new Date(bill.date);
		const monthMatch =
			!selectedMonth ||
			date.toLocaleString("default", { month: "long" }) === selectedMonth;
		const yearMatch =
			!selectedYear || date.getFullYear().toString() === selectedYear;
		return monthMatch && yearMatch;
	});

	const groupedBills = groupBillsByMonth(filteredBills);

	const formatter = new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	});

	const calculateTotal = (bills: Bill[], month: string) => {
		const total = bills.reduce(
			(sum, bill) => sum + parseFloat(bill.amount),
			0
		);
		return (
			<div className={styles.total}>
				<span>Total for {month}</span>
				<span className={styles.totalAmount}>
					{formatter.format(total)}
				</span>
			</div>
		);
	};

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
						{Object.entries(groupedBills)
							.sort(
								([monthA], [monthB]) =>
									new Date(monthA).getTime() -
									new Date(monthB).getTime()
							)
							.map(([month, bills]) => (
								<div key={month} className={styles.monthCard}>
									<h2 className={styles.monthTitle}>
										{month}
									</h2>
									<table className={styles.billsTable}>
										<thead>
											<tr>
												<th>Date</th>
												<th>Type</th>
												<th>Status</th>
												<th>Amount</th>
											</tr>
										</thead>
										<tbody>
											{bills
												.sort(
													(a, b) =>
														new Date(
															a.date
														).getTime() -
														new Date(
															b.date
														).getTime()
												)
												.map((bill) => (
													<tr key={bill.id}>
														<td>
															{new Date(
																bill.date
															).toLocaleDateString()}
														</td>
														<td>{bill.type}</td>
														<td>
															<span
																className={`${
																	styles.status
																} ${
																	styles[
																		bill
																			.status
																	]
																}`}
															>
																{bill.status
																	.charAt(0)
																	.toUpperCase() +
																	bill.status.slice(
																		1
																	)}
															</span>
														</td>
														<td>
															{formatter.format(
																parseFloat(
																	bill.amount
																)
															)}
														</td>
													</tr>
												))}
										</tbody>
									</table>
									<>{calculateTotal(bills, month)}</>
								</div>
							))}
						{Object.keys(groupedBills).length === 0 && (
							<div>No bills found for selected filters.</div>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
