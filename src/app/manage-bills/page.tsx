"use client";

import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";
import styles from './manageBill.module.css';

interface Bill {
	id: number;
	date: string;
	status: "paid" | "unpaid" | "pending";
	type: string;
	amount: string;
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
	return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending
}

const ManageBillsPage = () => {
	const [bills, setBills] = useState<Bill[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [billToDelete, setBillToDelete] = useState<number | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [billToEdit, setBillToEdit] = useState<Bill | null>(null);
	const [editFormData, setEditFormData] = useState<Bill | null>(null);
	const [editMessage, setEditMessage] = useState("");
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
			date: "2025-09-03",
			status: "paid",
			type: "ICICI credit card",
			amount: "31627.85",
		},
		{
			id: 5,
			date: "2025-10-05",
			status: "paid",
			type: "Electricity ",
			amount: "84",
		},
	];

	const formatter = new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	});

	const fetchBills = async () => {
		setLoading(true);
		setError(null);

		// Uncomment below to fetch from mock
		setBills(mockData);
		setLoading(false);

		// try {
		// 	const response = await fetch(
		// 		"https://track-bill-api.onrender.com/api/bills"
		// 	);
		// 	if (!response.ok) {
		// 		throw new Error(`HTTP error! Status: ${response.status}`);
		// 	}
		// 	const data = await response.json();
		// 	setBills(data);
		// } catch (err: unknown) {
		// 	if (err instanceof Error) {
		// 		console.error("Failed to fetch bills:", err);
		// 	}
		// 	setError(
		// 		"Failed to fetch bills. Please check the network connection and API status."
		// 	);
		// } finally {
		// 	setLoading(false);
		// }
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

	const years = getUniqueYears(bills);

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

	useEffect(() => {
		fetchBills();
	}, []);

	const handleDeleteClick = (id: number) => {
		setBillToDelete(id);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		try {
			const response = await fetch(
				`https://track-bill-api.onrender.com/api/bills/${billToDelete}`,
				{
					method: "DELETE",
				}
			);
			if (!response.ok) {
				throw new Error("Failed to delete bill");
			}
			setSuccessMessage("Bill deleted successfully!");
			setErrorMessage("");
			fetchBills(); // Re-fetch the bills to update the list
		} catch (err: unknown) {
			setErrorMessage("Failed to delete bill. Please try again.");
			setSuccessMessage("");
			if (err instanceof Error) {
				console.error("Failed to delete bill:", err);
			}
		} finally {
			setIsDeleteModalOpen(false);
			setBillToDelete(null);
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setBillToDelete(null);
	};

	const handleEditClick = (bill: Bill) => {
		setBillToEdit(bill);
		setEditFormData(bill);
		setIsEditModalOpen(true);
		setSuccessMessage("");
		setErrorMessage("");
	};

	const handleEditChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setEditFormData((prevData) =>
			prevData ? { ...prevData, [name]: value } : null
		);
	};

	const handleSaveEdit = async () => {
		if (!editFormData || !billToEdit) return;

		try {
			setEditMessage("Saving changes...");
			const response = await fetch(
				`https://track-bill-api.onrender.com/api/bills/${billToEdit.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(editFormData),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to update bill");
			}

			setSuccessMessage("Bill updated successfully!");
			setErrorMessage("");
			setIsEditModalOpen(false);
			setBillToEdit(null);
			fetchBills(); // Re-fetch the bills to get the updated list
		} catch (err: unknown) {
			if (err instanceof Error) {
				setErrorMessage(err.message);
			} else {
				setErrorMessage("Failed to update bill. Please try again.");
			}
			setSuccessMessage("");
		}
	};

	const handleCancelEdit = () => {
		setIsEditModalOpen(false);
		setBillToEdit(null);
		setEditFormData(null);
		setEditMessage("");
		setErrorMessage("");
		setSuccessMessage("");
	};

	if (loading) {
		return (
			<>
				<NavBar
					rightLinks={[
						{ href: "/", label: "Home" },
						{ href: "/add-bill", label: "Add Bill" },
					]}
				/>
				<div className={styles.container}>
					<p className={styles.loading}>Loading bills...</p>
				</div>
			</>
		);
	}

	if (error) {
		return (
			<>
				<NavBar
					rightLinks={[
						{ href: "/", label: "Home" },
						{ href: "/add-bill", label: "Add Bill" },
					]}
				/>
				<div className="container">
					<p className="errorMessage">{error}</p>
				</div>
				<style jsx>{`
					.errorMessage {
						background-color: #f8d7da;
						color: #721c24;
						padding: 12px;
						border-radius: 4px;
						margin-bottom: 20px;
						text-align: center;
					}
				`}</style>
			</>
		);
	}

	return (
		<>
			<NavBar
				rightLinks={[
					{ href: "/", label: "Home" },
					{ href: "/add-bill", label: "Add Bill" },
				]}
			/>
			<div className={styles.container}>
				<h2 className={styles.title}>Manage Bills</h2>
				{successMessage && (
					<div className={styles.successMessage}>
						{successMessage}
					</div>
				)}
				{errorMessage && (
					<div className={styles.errorMessage}>{errorMessage}</div>
				)}
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
				{filteredBills.length === 0 ? (
					<p className={styles.noBillsMessage}>
						No bills found for the selected filters. Add one from
						the Add Bill page.
					</p>
				) : (
					<>
						{Object.entries(groupedBills).map(
							([month, monthBills]) => (
								<div key={month}>
									<h3 className={styles.subTitle}>{month}</h3>
									<ul className={styles.billList}>
										{monthBills
											.sort(
												(a, b) =>
													new Date(b.date).getTime() -
													new Date(a.date).getTime()
											)
											.map((bill: Bill) => (
												<li
													key={bill.id}
													className={styles.billItem}
												>
													<div
														className={
															styles.billInfo
														}
													>
														<div
															className={
																styles.billPrimaryInfo
															}
														>
															<span
																className={
																	styles.billType
																}
															>
																{bill.type}
															</span>
															<span
																className={
																	styles.billAmount
																}
															>
																{formatter.format(
																	parseFloat(
																		bill.amount
																	)
																)}
															</span>
														</div>
														<div
															className={
																styles.billSecondaryInfo
															}
														>
															<span
																className={
																	styles.billDate
																}
															>
																{new Date(
																	bill.date
																).toLocaleDateString()}
															</span>
															<span
																className={`${
																	styles.billStatus
																} ${
																	styles[
																		bill
																			.status
																	]
																}`}
															>
																{bill.status}
															</span>
														</div>
													</div>
													<div
														className={
															styles.billActions
														}
													>
														<button
															onClick={() =>
																handleEditClick(
																	bill
																)
															}
															className={`${styles.button} ${styles.editButton}`}
														>
															Edit
														</button>
														<button
															onClick={() =>
																handleDeleteClick(
																	bill.id
																)
															}
															className={`${styles.button} ${styles.deleteButton}`}
														>
															Delete
														</button>
													</div>
												</li>
											))}
									</ul>
								</div>
							)
						)}
					</>
				)}

				{isDeleteModalOpen && (
					<div className={styles.modalOverlay}>
						<div className={styles.modalContent}>
							<p>Are you sure you want to delete this bill?</p>
							<div className={styles.modalButtons}>
								<button
									onClick={handleConfirmDelete}
									className={
										styles.button +
										" " +
										styles.confirmButton
									}
								>
									Yes, Delete
								</button>
								<button
									onClick={handleCancelDelete}
									className={
										styles.button +
										" " +
										styles.cancelButton
									}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				)}
				{isEditModalOpen && editFormData && (
					<div className={styles.modalOverlay}>
						<div className={styles.modalContent}>
							<h3>Edit Bill</h3>
							{errorMessage && (
								<div className={styles.errorMessage}>
									{errorMessage}
								</div>
							)}
							{editMessage && (
								<div className={styles.infoMessage}>
									{editMessage}
								</div>
							)}
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleSaveEdit();
								}}
							>
								<div className={styles.formGroup}>
									<label>Type:</label>
									<input
										type="text"
										name="type"
										value={editFormData.type}
										onChange={handleEditChange}
										className={styles.input}
										required
									/>
								</div>
								<div className={styles.formGroup}>
									<label>Amount:</label>
									<input
										type="text"
										name="amount"
										value={editFormData.amount}
										onChange={handleEditChange}
										className={styles.input}
										required
									/>
								</div>
								<div className={styles.formGroup}>
									<label>Date:</label>
									<input
										type="date"
										name="date"
										value={editFormData.date}
										onChange={handleEditChange}
										className={styles.input}
										required
									/>
								</div>
								<div className={styles.formGroup}>
									<label>Status:</label>
									<select
										name="status"
										value={editFormData.status}
										onChange={handleEditChange}
										className={styles.select}
									>
										<option value="paid">Paid</option>
										<option value="unpaid">Unpaid</option>
										<option value="pending">Pending</option>
									</select>
								</div>
								<div className={styles.modalButtons}>
									<button
										type="submit"
										className={`${styles.button} ${styles.saveButton}`}
									>
										Save
									</button>
									<button
										type="button"
										onClick={handleCancelEdit}
										className={
											styles.button +
											" " +
											styles.cancelButton
										}
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default ManageBillsPage;