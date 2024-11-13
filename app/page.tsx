import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>WORK IN PROGRESS</h1>
            <Image
              src="/liampirate.jpg"
              alt="liam pirate"
              priority
            />
            <Image
              src="/younglove.jpg"
              alt="young love"
              priority
            />
    </main>
  );
}
