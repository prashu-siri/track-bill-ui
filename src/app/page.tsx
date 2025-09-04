"use client";

import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import styles from "./page.module.css";

type Bill = {
	id: number;
	date: string; // ISO date string
	type: string;
	amount: number;
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

	useEffect(() => {
		// Replace with your actual API endpoint

		fetch("/api/bills")
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

	return (
		<div className={styles.page}>
			<NavBar rightLinks={[{ href: "/add-bill", label: "Add Bill" }]} />
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
						{Object.entries(groupedBills).map(([month, bills]) => (
							<div key={month} className={styles.monthCard}>
								<h2 className={styles.monthTitle}>{month}</h2>
								<table className={styles.billsTable}>
									<thead>
										<tr>
											<th>Date</th>
											<th>Type</th>
											<th>Amount</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
										{bills.map((bill) => (
											<tr key={bill.id}>
												<td>
													{new Date(
														bill.date
													).toLocaleDateString()}
												</td>
												<td>{bill.type}</td>
												<td>
													${bill.amount.toFixed(2)}
												</td>
												<td>
													<span
														className={`${
															styles.status
														} ${
															styles[bill.status]
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
											</tr>
										))}
									</tbody>
								</table>
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
