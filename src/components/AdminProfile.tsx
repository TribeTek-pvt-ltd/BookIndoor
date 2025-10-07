"use client";

interface AdminProfileProps {
  adminId: number;
}

export default function AdminProfile({ adminId }: AdminProfileProps) {
  // In real app, replace with backend API call
  const mockAdmins = [
    {
      id: 1,
      name: "John Doe",
      phone_no: "0712345678",
      email: "john@example.com",
      address: "Colombo",
      nic_no: "123456789V",
      bank_name: "BOC",
      account_no: "1234567890",
      branch: "Colombo Main",
    },
  ];

  const admin = mockAdmins.find((a) => a.id === adminId);

  if (!admin) return <p className="text-gray-500">Admin not found.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{admin.name}</h1>
      <div className="space-y-2">
        <p><strong>Email:</strong> {admin.email}</p>
        <p><strong>Phone:</strong> {admin.phone_no}</p>
        <p><strong>NIC:</strong> {admin.nic_no}</p>
        <p><strong>Address:</strong> {admin.address}</p>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Bank Details</h3>
        <p><strong>Bank Name:</strong> {admin.bank_name}</p>
        <p><strong>Account No:</strong> {admin.account_no}</p>
        <p><strong>Branch:</strong> {admin.branch}</p>
      </div>
    </div>
  );
}
