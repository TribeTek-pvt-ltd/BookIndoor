"use client";

interface BookingSummaryTabProps {
  selectedSport?: string;
}

const summaryData = {
  weekly: {
    income: 12000,
    totalBookings: 25,
    sports: {
      Badminton: 10,
      Futsal: 8,
      Basketball: 7,
    },
  },
  monthly: {
    income: 48000,
    totalBookings: 110,
    sports: {
      Badminton: 40,
      Futsal: 35,
      Basketball: 35,
    },
  },
  yearly: {
    income: 560000,
    totalBookings: 1300,
    sports: {
      Badminton: 500,
      Futsal: 400,
      Basketball: 400,
    },
  },
};

export default function BookingSummaryTab({ selectedSport }: BookingSummaryTabProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {Object.entries(summaryData).map(([period, data]) => (
        <div key={period} className="bg-white p-6 rounded-lg shadow-md">
          {/* Period Title */}
          <h3 className="text-lg font-semibold text-gray-800 capitalize text-center">
            {period}
          </h3>

          {/* Income */}
          <p className="text-2xl font-bold text-green-600 text-center">
            Rs. {data.income.toLocaleString()}
          </p>

          {/* Total Bookings */}
          <p className="mt-2 text-sm font-medium text-gray-700 text-center">
            Total Bookings:{" "}
            <span className="font-bold">{data.totalBookings}</span>
          </p>

          {/* Sports Breakdown */}
          <div className="mt-4 space-y-1">
            {Object.entries(data.sports).map(([sport, count]) => (
              <p
                key={sport}
                className={`text-sm ${
                  selectedSport === sport
                    ? "font-bold text-indigo-600"
                    : "text-gray-600"
                }`}
              >
                <span className="font-medium">{sport}:</span> {count} bookings
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
