import Link from "next/link";
import Image from "next/image";
import Oops from "../public/oops.svg";
import { XOctagonIcon, WebhookIcon } from 'lucide-react';

/**
 * Default Not Found page handler
 * @constructor
 */
export default function NotFound() {
    return (
        <div className="global mx-auto max-w-screen-2xl h-screen bg-mentat-black text-mentat-gold">
            <h2 className="text-center mb-5 text-2xl italic">
                Whoops...something went wrong
                <span>
                    {/*<Image src={Oops} alt={"Whoops"} className="bg-white mx-auto mt-5"></Image>*/}
                    <WebhookIcon
                        className="mx-auto mt-5 w-32 h-32" />
                </span>
            </h2>
            <p className="text-center text-xl">Mentat&#39;s are working
                hard to figured out what went wrong</p>
            <p className="text-center text-xl">Rest assured, you are not
                the only one seeing this error</p>
            <hr className="my-14 border-crimson border-2 align-middle" />
            <p className="text-center text-xl">This is possibly a login error.
                Please try and login by clicking below</p>
            <div className="flex items-center mt-14">
                <Link
                    className="mx-auto text-mentat-gold bg-crimson hover:bg-crimson-700 py-2 px-4
                        rounded-xl shadow-sm shadow-mentat-gold-700"
                      href="/auth/signin">Login</Link>
            </div>
        </div>
    );
}