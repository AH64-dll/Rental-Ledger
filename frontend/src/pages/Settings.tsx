import { useState } from "react";
import { useMe } from "../hooks/useAuth";

export function Settings() {
  const { data: user } = useMe();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setMessage("Password change is not yet available.");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Settings</h2>

      <div className="bg-white rounded shadow-sm p-4 mb-6">
        <h3 className="text-lg font-medium mb-2">Account</h3>
        <p className="text-sm text-gray-600">
          Logged in as <strong>{user?.username || "..."}</strong>
        </p>
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          {message && (
            <p className="text-sm text-blue-600">{message}</p>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm self-start"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
