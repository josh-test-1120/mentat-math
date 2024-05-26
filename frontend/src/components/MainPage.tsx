import Link from "next/link";
import Image from "next/image";

export default function MainPage() {
  const img = "/ux-design.png";
  return (
    <section
        id={"mainPage"}
        className="bg-gray-900 text-amber-400 font-bold bg-gradient-to-r from-zinc-700 via-black-500 to-zinc-800"
        style={{ borderBottomLeftRadius: "5%", borderBottomRightRadius: "5%"}}
      >
        <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
          <div className="mx-auto max-w-3xl text-left lg:ml-auto">
            <h1 className="bg-gradient-to-r from-red-300 via-black-500 to-yellow-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
              EZMath HomePage
              <span className="sm:block"> Alpha Build. </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl sm:text-xl sm:leading-relaxed">
              This is where we can put some interesting information.
            </p>
          </div>
        </div>
      </section>
    );
  }
