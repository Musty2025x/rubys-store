
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "./actions";

type Props = {
  orderId: string;
  currentStatus: string;
  allowedStatuses: string[];
};

export default function OrderStatusForm({
  orderId,
  currentStatus,
  allowedStatuses,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!status) {
      setMessage("Please select a new order status.");
      return;
    }

    if (
      status === "CANCELLED" &&
      !window.confirm(
        "Are you sure you want to cancel this order? Its stock will be restored."
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("status", status);

    startTransition(async () => {
      const result = await updateOrderStatus(formData);
      setMessage(result.message);
      setSuccess(result.success);

      if (result.success) {
        setStatus("");
        router.refresh();
      }
    });
  }

  return (
    <div>
      <p className="text-sm font-medium text-neutral-800">
        Current status: {currentStatus.replaceAll("_", " ")}
      </p>

      {allowedStatuses.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">
          No further status changes are available.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-neutral-600">
            UPDATE ORDER STATUS
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm"
              disabled={isPending}
            >
              <option value="">Select next status</option>
              {allowedStatuses.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={isPending || !status}
            className="w-full rounded-lg bg-neutral-900 px-5 py-3 text-sm text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update order"}
          </button>
        </form>
      )}

      {message && (
        <p
          role={success ? "status" : "alert"}
          className={`mt-3 text-sm ${
            success ? "text-green-700" : "text-red-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
