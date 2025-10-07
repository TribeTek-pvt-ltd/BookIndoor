"use client";

const summaryData = {
  totalAdmins: 12,
  totalGrounds: 8,
  income: {
    weekly: 120000,
    monthly: 480000,
    yearly: 5600000,
  },
};

export default function SuperAdminSummaryTab() {
  const summaryCards = [
    {
      title: "Total Admins",
      value: summaryData.totalAdmins,
      color: "indigo",
    },
    {
      title: "Total Grounds",
      value: summaryData.totalGrounds,
      color: "green",
    },
    {
      title: "Weekly Income",
      value: `Rs. ${summaryData.income.weekly.toLocaleString()}`,
      color: "blue",
    },
    {
      title: "Monthly Income",
      value: `Rs. ${summaryData.income.monthly.toLocaleString()}`,
      color: "blue",
    },
    {
      title: "Yearly Income",
      value: `Rs. ${summaryData.income.yearly.toLocaleString()}`,
      color: "blue",
    },
  ];

  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600",
    green: "text-green-600",
    blue: "text-blue-600",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {summaryCards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-default"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h3>
          <p className={`text-2xl font-bold ${colorMap[card.color]}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
