'use client';
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import NavBar from "../../components/NavBar";
import styles from "./addBill.module.css";

type BillFormInputs = {
	date: string;
	type: string;
	amount: number;
	status: string;
};

const AddBillsForm: React.FC = () => {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<BillFormInputs>();
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (successMessage || errorMessage) {
			const timer = setTimeout(() => {
				setSuccessMessage(null);
				setErrorMessage(null);
			}, 5000); // Hide messages after 5 seconds
			return () => clearTimeout(timer);
		}
	}, [successMessage, errorMessage]);

	const onSubmit: SubmitHandler<BillFormInputs> = (data) => {
		setSuccessMessage(null);
		setErrorMessage(null);
		// Handle form submission logic here
		fetch("https://track-bill-api.onrender.com/api/bills", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		})
			.then((response) => {
				if (!response.ok) throw new Error("Failed to add bill");
				return response.json();
			})
			.then((result) => {
				setSuccessMessage("Bill submitted successfully!");
				console.log("Bill added:", result);
			})
			.catch((error) => {
				setErrorMessage("Failed to submit bill. Please try again.");
				console.error(error);
			});
		reset();
	};

	return (
		<>
			<NavBar rightLinks={[{ href: "/", label: "Home" }]} />
			{successMessage && (
				<div className="mb-4 p-4 text-center text-white bg-green-500 rounded-lg">
					{successMessage}
				</div>
			)}
			{errorMessage && (
				<div className="mb-4 p-4 text-center text-white bg-red-500 rounded-lg">
					{errorMessage}
				</div>
			)}
			<div className={styles.formContainer}>
				<form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
					<h2 className={styles.title}>Add a New Bill</h2>
					<div className={styles.formGroup}>
						<label>Date:</label>
						<input
							type="date"
							{...register("date", { required: true })}
							className={styles.input}
							onFocus={(e) =>
								e.target.showPicker && e.target.showPicker()
							}
						/>
						{errors.date && (
							<span className={styles.error}>
								Date is required
							</span>
						)}
					</div>
					<div className={styles.formGroup}>
						<label>Status:</label>
						<select
							{...register("status", { required: true })}
							className={styles.input}
						>
							<option value="">Select status</option>
							<option value="paid">Paid</option>
							<option value="unpaid">Unpaid</option>
							<option value="pending">Pending</option>
						</select>
						{errors.status && (
							<span className={styles.error}>
								Status is required
							</span>
						)}
					</div>
					<div className={styles.formGroup}>
						<label>Type:</label>
						<input
							type="text"
							{...register("type", { required: true })}
							className={styles.input}
							placeholder="e.g. Electricity"
						/>
						{errors.type && (
							<span className={styles.error}>
								Type is required
							</span>
						)}
					</div>
					<div className={styles.formGroup}>
						<label>Amount:</label>
						<input
							type="number"
							step="0.01"
							min="0"
							{...register("amount", { required: true, min: 0 })}
							className={styles.input}
							placeholder="e.g. 100.00"
						/>
						{errors.amount && (
							<span className={styles.error}>
								Amount is required and must be &gt;= 0
							</span>
						)}
					</div>
					<button type="submit" className={styles.button}>
						Add Bill
					</button>
				</form>
			</div>
		</>
	);
};

export default AddBillsForm;