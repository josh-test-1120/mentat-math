import Link from "next/link";
import Image from "next/image";
import Oops from "../public/oops.svg";

export default function NotFound() {
    return (
        <div className="global mx-auto max-w-screen-2xl h-screen bg-mentat-black text-mentat-gold">
            <h2 className="text-center mb-5 text-2xl italic">
                Whoops...something went wrong
                <span>
                    <Image src={Oops} alt={"Whoops"} className="bg-white mx-auto mt-5"></Image>
                </span>
            </h2>
            <p className="text-center text-xl">Mentat's are working hard to figured out what went wrong</p>
            <p className="text-center text-xl">Rest assured, you are not the only one seeing this error</p>
            <div className="flex items-center mt-5">
                <Link className="mx-auto text-yellow-300 bg-red-700 hover:bg-red-600 py-2 px-4 rounded-xl"
                      href="/auth/signin">Login</Link>
            </div>
        </div>
    );
}