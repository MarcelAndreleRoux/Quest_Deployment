import AuthButton from "@/components/ui/authButton";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <main className="flex flex-col items-center gap-8 max-w-xl w-full">
        <Image
          src="/icons/icon-512x512.png"
          alt="Quest App Logo"
          width={256}
          height={256}
          className="mb-2 drop-shadow-lg"
          priority
        />
        <h1 className="text-4xl font-extrabold text-indigo-700 text-center">
          Welcome to Quest
        </h1>
        <p className="text-lg text-gray-700 text-center">
          Quest is your gateway to interactive scavenger hunt quests in the museum!
          <br />
          Explore exhibits, solve clues, and compete with fellow students for exciting
          prizes.
          <br />
          Ready to start your adventure?
        </p>
        <AuthButton />
      </main>
      <footer className="w-full absolute bottom-0 left-0 py-4 text-gray-400 text-sm text-center bg-transparent">
        &copy; {new Date().getFullYear()} Quest &mdash; Museum Scavenger Hunt
      </footer>
    </div>
  );
}
