import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>HI ROBYN!</h1>
            <Image
              src="/younglove.jpg"
              alt="young love"
              className="dark:invert"
              priority
            />
    </main>
  );
}
