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

const ManageBillsPage = () => {
	const [bills, setBills] = useState<Bill[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [billToDelete, setBillToDelete] = useState<number | null>(null);
	const [editMessage, setEditMessage] = useState("");

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

	const fetchBills = async () => {
		setLoading(true);
		setError(null);

		setBills(mockData);
		setLoading(false);
		// Uncomment below to fetch from actual API
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

	const groupedBills = groupBillsByMonth(bills);

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

	const handleEdit = (bill: Bill) => {
		setEditMessage(
			`This is where you would edit the bill for: ${
				bill.type
			} on ${new Date(bill.date).toLocaleDateString()}`
		);
		setSuccessMessage("");
		setErrorMessage("");
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
				{editMessage && (
					<div className={styles.infoMessage}>{editMessage}</div>
				)}
				{bills.length === 0 ? (
					<p>No bills found. Add one from the Add Bill page.</p>
				) : (
					<>
						{Object.entries(groupedBills).map(([month, bills]) => (
							<div key={month}>
								<h3 className={styles.subTitle}>{month}</h3>
								<ul className={styles.billList}>
									{bills.map((bill: Bill) => (
										<li
											key={bill.id}
											className={styles.billItem}
										>
											<div>
												<div
													className={styles.billInfo}
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
														Amount: {bill.amount}
													</span>
													<span
														className={
															styles.billDate
														}
													>
														Date:{" "}
														{new Date(
															bill.date
														).toLocaleDateString()}
													</span>
													<span
														className={`billStatus ${bill.status}`.toLowerCase()}
													>
														Status: {bill.status}
													</span>
												</div>
											</div>
											<div className={styles.billActions}>
												<button
													onClick={() =>
														handleEdit(bill)
													}
													className={
														styles.button +
														" " +
														styles.editButton
													}
												>
													Edit
												</button>
												<button
													onClick={() =>
														handleDeleteClick(
															bill.id
														)
													}
													className={
														styles.button +
														" " +
														styles.deleteButton
													}
												>
													Delete
												</button>
											</div>
										</li>
									))}
								</ul>
							</div>
						))}
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
			</div>
		</>
	);
};

export default ManageBillsPage;
