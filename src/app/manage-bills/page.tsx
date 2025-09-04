"use client";

import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";
import styles from './manageBill.module.css';

interface Bill {
	id: number;
	date: string;
	status: "paid" | "unpaid" | "pending";
	type: string;
	amount: number;
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

  const fetchBills = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				"https://track-bill-api.onrender.com/api/bills"
			);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const data = await response.json();
			setBills(data);
		} catch (err: unknown) {
			if (err instanceof Error) {
				console.error("Failed to fetch bills:", err);
			}
			setError(
				"Failed to fetch bills. Please check the network connection and API status."
			);
		} finally {
			setLoading(false);
		}
  };

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
						{ href: "/add-bill", label: "Add Bill" }
					]}
				/>
				<div className="container">
					<p>Loading bills...</p>
				</div>
				<style jsx>{`
					.container {
						max-width: 800px;
						margin: 40px auto;
						padding: 20px;
						background-color: #fff;
						border-radius: 8px;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
						font-family: Arial, sans-serif;
					}
				`}</style>
			</>
		);
	}

	if (error) {
		return (
			<>
				<NavBar
					rightLinks={[
						{ href: "/", label: "Home" },
						{ href: "/add-bill", label: "Add Bill" }
					]}
				/>
				<div className="container">
					<p className="errorMessage">{error}</p>
				</div>
				<style jsx>{`
					.container {
						max-width: 800px;
						margin: 40px auto;
						padding: 20px;
						background-color: #fff;
						border-radius: 8px;
						box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
						font-family: Arial, sans-serif;
					}
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
					{ href: "/add-bill", label: "Add Bill" }
				]}
			/>
			<div className="container">
				<h2 className="title">Manage Bills</h2>
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
					<p>No bills found. Add one from the "Add Bill" page.</p>
				) : (
					<ul className={styles.billList}>
						{bills.map((bill) => (
							<li key={bill.id} className={styles.billItem}>
								<div>
									<div className={styles.billInfo}>
										<span className={styles.billType}>
											Type: {bill.type}
										</span>
										<span className={styles.billAmount}>
											Amount: ${bill.amount}
										</span>
									</div>
									<div className={styles.billMeta}>
										<span className={styles.billDate}>
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
										onClick={() => handleEdit(bill)}
										className="button editButton"
									>
										Edit
									</button>
									<button
										onClick={() =>
											handleDeleteClick(bill.id)
										}
										className="button deleteButton"
									>
										Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				)}

				{isDeleteModalOpen && (
					<div className={styles.modal}>
						<div className={styles.modalContent}>
							<p>Are you sure you want to delete this bill?</p>
							<div className={styles.modalButtons}>
								<button
									onClick={handleConfirmDelete}
									className="button confirmButton"
								>
									Yes, Delete
								</button>
								<button
									onClick={handleCancelDelete}
									className={
										styles.button && styles.cancelButton
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
