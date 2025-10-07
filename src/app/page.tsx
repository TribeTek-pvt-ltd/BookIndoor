import Image from "next/image";

export default function HomePage() {
  return (
    <section className="text-center py-20">
      <h2 className="text-4xl font-bold mb-4 text-indigo-600">Welcome to BookIndoor</h2>
      <p className="text-lg text-gray-700 mb-8">
        Find and book indoor sports arenas quickly and easily.
      </p>
      <a
        href="/user"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700"
      >
        Explore Grounds
      </a>
    </section>
  );
}