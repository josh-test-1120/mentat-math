import Link from "next/link";
import Image from "next/image";

/**
 * Default Main Page Component
 * @constructor
 */
export default function MainPage() {

  return (
    <section
        id={"mainPage"}
        className="text-amber-400 font-bold bg-gradient-to-r from-zinc-800 via-black-300 to-zinc-700"
        style={{ borderBottomLeftRadius: "5%", borderBottomRightRadius: "5%"}}
      >
        <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
          <div className="mx-auto max-w-3xl text-left lg:ml-auto">
            <h1 className="bg-gradient-to-r from-red-300 via-black-500 to-yellow-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
              EZMath HomePage
              <span className="sm:block"> Alpha Build. </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl sm:text-xl sm:leading-relaxed">
              This build focuses on student and instructor access to scheduling exams.
            </p>
          </div>
        </div>
      </section>
    );
  }
