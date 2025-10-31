'use client'

import React, {useEffect, useRef, useState} from 'react';
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    CalendarCheck,
    ChartPie,
    ClipboardList,
    HousePlus,
    KeyRound,
    Menu,
    MessageCircleQuestionMark, UserRoundPen
} from "lucide-react";

/**
 * Default Sidebar Navigation Component
 * @constructor
 */
export default function Sidebar() {
    // State to manage the open/close state of the sidebar
    const [isOpen, setIsOpen] = useState(true);
    // Refs for the elements we need to manipulate
    const sidebarParentRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const middleRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const hamburgerBlockRef = useRef<HTMLDivElement>(null);
    const hamburgerParentRef = useRef<HTMLDivElement>(null);

    // Date and Time
    const [currDate, setCurrDate] = useState('');
    const [currTime, setCurrTime] = useState('');
    const [userType, setUserType] = useState<string | null | undefined>('Student');
    const { data: session, status } = useSession();

    // Timer logic
    useEffect(() => {
        // This code runs only on the client side
        const now = new Date();
        setCurrDate(now.toLocaleDateString());
        setCurrTime(now.toLocaleTimeString());

        // Optional: Update time every second if you want a live clock
        const timer = setInterval(() => {
            const current = new Date();
            setCurrDate(current.toLocaleDateString());
            setCurrTime(current.toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Session logic
    useEffect(() => {
        if (session?.user?.userType !== undefined && session?.user?.userType !== null) {
            setUserType(session?.user?.userType?.toString());
        }
    }, [session, status]);

    // Set initial expanded state
    useEffect(() => {
        const timer = setTimeout(() => {
            if (sidebarRef.current && isOpen) {
                // Ensure expanded state on initial render
                sidebarRef.current.classList.remove("bg-mentat-black");
                sidebarRef.current.classList.add("bg-gradient-to-br", "from-crimson-700", "via-mentat-black/50", "to-mentat-black");

                hamburgerBlockRef.current?.classList.remove("bg-mentat-black");
                hamburgerParentRef.current?.classList.remove("absolute", "bg-mentat-black");

                bottomRef.current?.classList.remove("invisible");
                middleRef.current?.classList.remove("invisible");

                hamburgerBlockRef.current?.classList.remove("rounded-xl");
                hamburgerParentRef.current?.classList.remove("rounded-xl");
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [isOpen]);

    /**
     * Collapse and Uncollapse Toggle event
     * @param e DOM event
     */
    const sidebarHandler = async (e: any) => {
        e.preventDefault();
        console.log('Sidebar Handler');

        const newIsOpen = !isOpen;

        requestAnimationFrame(() => {
            // Check if all refs are available
            if (!sidebarRef.current || !middleRef.current || !bottomRef.current ||
                !hamburgerBlockRef.current || !hamburgerParentRef.current ||
                !sidebarParentRef.current) {
                return;
            }

            if (!newIsOpen) {
                // COLLAPSE sequence - order important for graceful transition
                // 1. Adjust the sidebar colors
                sidebarRef.current.classList.remove("bg-gradient-to-br",
                    "from-crimson-700", "via-mentat-black/50", "to-mentat-black");
                sidebarRef.current.classList.add("bg-mentat-black");

                // 2. Hamburger block background
                hamburgerBlockRef.current.classList.add("bg-mentat-black");

                // 3. Shift the hamburger into absolute position
                hamburgerParentRef.current.classList.add("absolute");
                hamburgerParentRef.current.classList.add("bg-mentat-black");

                // 4. Bottom element visibility
                bottomRef.current.classList.add("invisible");

                // 5. Middle element visibility
                middleRef.current.classList.add("invisible");

                // 6. Update rounded status
                hamburgerBlockRef.current.classList.add("rounded-xl");
                hamburgerParentRef.current.classList.add("rounded-xl");
                // 7. Update the parent reference
                sidebarParentRef.current.classList.remove("w-68");
                sidebarParentRef.current.classList.add("w-4");
            } else {
                // EXPAND sequence - order important for graceful transition
                // 1. Adjust the sidebar colors
                sidebarRef.current.classList.remove("bg-mentat-black");
                sidebarRef.current.classList.add("bg-gradient-to-br",
                    "from-crimson-700", "via-mentat-black/50", "to-mentat-black");

                // 2. Hamburger block background
                hamburgerBlockRef.current.classList.remove("bg-mentat-black");

                // 3. Normalize the hamburger
                hamburgerParentRef.current.classList.remove("absolute");
                hamburgerParentRef.current.classList.remove("bg-mentat-black");

                // 4. Bottom element visibility
                bottomRef.current.classList.remove("invisible");

                // 5. Middle element visibility
                middleRef.current.classList.remove("invisible");

                // 6. Update the rounded corners
                hamburgerBlockRef.current.classList.remove("rounded-xl");
                hamburgerParentRef.current.classList.remove("rounded-xl");
                // 7. Update the parent reference
                sidebarParentRef.current.classList.remove("w-4");
                sidebarParentRef.current.classList.add("w-68");
            }
        });

        setIsOpen(newIsOpen);
    };

    return (
        <div
            id="sidebar-box"
            ref={sidebarParentRef}
            className={`w-68 flex-shrink-0 transition-all duration-300 ease-in-out`}
        >
            <aside
                ref={sidebarRef}
                id="sidebar"
                className="h-full w-full flex flex-col transition-[width]
                        ease-in-out delay-50 bg-gradient-to-br
                        from-crimson-700  via-mentat-black/50 to-mentat-black"
                aria-label="Sidenav"
            >
                {/* Put back the entire hgslider-block as this is REQUIRED for collapse animations*/}
                <div id="sidebar-header">
                    {/* Floating slider box */}
                    <div
                        ref={hamburgerBlockRef}
                        id="hgslider-block"
                        className={`
                          z-10 inline-block w-full rounded-lg
                          transition-all duration-300 ease-in-out`}
                    >
                        <div
                            id="hgSlider"
                            className={`
                                h-8 inline-block align-top 
                                transition-all duration-300 ease-in-out
                                ${isOpen ? 'w-[14rem] opacity-100' : 'translate-x-[-200px] opacity-0'}
                              `}
                        >
                            &nbsp;
                        </div>

                        <div
                            ref={hamburgerParentRef}
                            id="hgslider-parent"
                            className="inline-block"
                        >
                            <a
                                href="#"
                                onClick={sidebarHandler}
                                className="group flex items-center p-2 text-base font-normal rounded-lg
                                hover:bg-crimson-700 group"
                            >
                                <Menu
                                    className={`
                                        w-4 h-4 text-mentat-gold/80 transition-all duration-150
                                        group-hover:bg-crimson-700
                                        ${isOpen ? 'zinc-900 rotate-0' : 'bg-mentat-black rotate-180'}
                                      `}
                                />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Menu selections and details */}
                <div
                    ref={middleRef}
                    id="sidebar-middle"
                    className="flex-1 overflow-y-auto pb-5 px-3"
                >
                    <ul className="space-y-2">
                        <li>
                            <Link href="/dashboard"
                                  className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                                        dark:text-white hover:bg-mentat-gold/80 dark:hover:bg-gray-700
                                        hover:text-crimson group">
                                <HousePlus
                                    className="w-6 h-6 text-mentat-gold transition duration-75 dark:text-gray-400
                                    group-hover:text-gray-900 dark:group-hover:text-white"/>
                                <span className="ml-3">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/grades"
                                  className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                                        dark:text-white hover:bg-mentat-gold/80 dark:hover:bg-gray-700
                                        hover:text-crimson group">
                                <ClipboardList
                                    className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75
                                        group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"/>
                                <span className="ml-3">
                                    {userType === 'Student' ? 'Grades' : 'Exams'}
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/schedule"
                                  className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                                        dark:text-white hover:bg-mentat-gold/80 dark:hover:bg-gray-700
                                        hover:text-crimson group">
                                <CalendarCheck
                                    className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75
                                        group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"/>
                                <span className="ml-3">
                                    {userType === 'Student' ? 'Schedule Exam' : 'Create Test Window'}
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/reports"
                                  className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                                        dark:text-white hover:bg-mentat-gold/80 dark:hover:bg-gray-700
                                        hover:text-crimson group">
                                <ChartPie
                                    className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75
                                        group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"/>
                                <span className="ml-3">Reports</span>
                            </Link>
                        </li>
                    </ul>
                    <ul className="pt-5 mt-5 space-y-2 border-t border-mentat-gold/40 dark:border-gray-700">
                        <li>
                            <a href="#"
                               className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                               transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white
                               group disabled">
                                <UserRoundPen
                                    className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75
                                    dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                />
                                <span className="ml-3">Profile</span>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                               className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                               transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white
                               group disabled">
                                <KeyRound
                                    className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75
                                   dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                />
                                <span className="ml-3">Administration</span>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                               className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                               transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white
                               group disabled">
                                <MessageCircleQuestionMark
                                    className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75
                                    dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                />
                                <span className="ml-3">Help</span>
                            </a>
                        </li>
                    </ul>
                    { session ? (
                        <div>
                            {/* Line Divider */}
                            <hr className="border-mentat-gold/40 mt-5"></hr>
                            {/* User Info & Actions */}
                            <div className="items-center px-4 mt-5 space-x-4">
                                <div className="text-mentat-gold text-sm">
                                    <p>Email: {session?.user?.email}</p>
                                    <p>Username: {session?.user?.username}</p>
                                    <p>Role: {userType}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                    {/* Line Divider */}
                    <hr className="border-mentat-gold/40 mt-5"></hr>
                    {/* Date/Time Section */}
                    <div className="text-mentat-gold px-4 mt-5">
                        <div>Today's Date: <span id="date">{currDate}</span></div>
                        <div>Current Time: <span id="time">{currTime}</span></div>
                    </div>
                </div>
                {/*Footer Bar*/}
                <div
                    ref={bottomRef}
                    id="sidebar-bottom"
                    className="hidden bottom-0 left-0 justify-center p-1 rounded-md space-x-4 w-full lg:flex bg-mentat-gold dark:bg-mentat-gold-700 z-20"
                >
                    <p className="text-xs text-center">Copyright @2025</p>
                </div>

                {/*<div id="sidebar-bottom"*/}
                {/*    className="hidden bottom-0 left-0 justify-center p-4 space-x-4 w-full lg:flex bg-white dark:bg-gray-800 z-20">*/}
                {/*    <a href="#"*/}
                {/*       className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400*/}
                {/*            hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 disabled">*/}
                {/*       <SliderSvgComponent className="w-6 h-6"/>*/}
                {/*    </a>*/}
                {/*    <a href="#" data-tooltip-target="tooltip-settings"*/}
                {/*       className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400*/}
                {/*            dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600 disabled">*/}
                {/*        <SettingsSvgComponent className="w-6 h-6"/>*/}
                {/*    </a>*/}
                {/*    <div id="tooltip-settings" role="tooltip"*/}
                {/*         className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900*/}
                {/*            rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip disabled">*/}
                {/*        Settings page*/}
                {/*        <div className="tooltip-arrow" data-popper-arrow></div>*/}
                {/*    </div>*/}
                {/*    <button type="button" data-dropdown-toggle="language-dropdown"*/}
                {/*            className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:hover:text-white dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600">*/}
                {/*    <DropDownSvgComponent className={"h-5 w-5 rounded-full mt-0.5"}/>*/}
                {/*    </button>*/}
                {/*    <div*/}
                {/*        className="hidden z-50 my-4 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700"*/}
                {/*        id="language-dropdown">*/}
                {/*        <ul className="py-1" role="none">*/}
                {/*            <li>*/}
                {/*                <a href="#"*/}
                {/*                   className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600"*/}
                {/*                   role="menuitem">*/}
                {/*                    <div className="inline-flex items-center">*/}
                {/*                        <EnglishSvgComponent className={"h-3.5 w-3.5 rounded-full mr-2"}/>*/}
                {/*                        English (US)*/}
                {/*                    </div>*/}
                {/*                </a>*/}
                {/*            </li>*/}
                {/*            <li>*/}
                {/*                <a href="#"*/}
                {/*                   className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"*/}
                {/*                   role="menuitem">*/}
                {/*                    <div className="inline-flex items-center">*/}
                {/*                        <GermanSvgComponent className="h-3.5 w-3.5 rounded-full mr-2"/>*/}
                {/*                        Deutsch*/}
                {/*                    </div>*/}
                {/*                </a>*/}
                {/*            </li>*/}
                {/*            <li>*/}
                {/*                <a href="#"*/}
                {/*                   className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"*/}
                {/*                   role="menuitem">*/}
                {/*                    <div className="inline-flex items-center">*/}
                {/*                        <ItalianSvgComponent className="h-3.5 w-3.5 rounded-full mr-2"/>*/}
                {/*                        Italiano*/}
                {/*                    </div>*/}
                {/*                </a>*/}
                {/*            </li>*/}
                {/*            <li>*/}
                {/*                <a href="#"*/}
                {/*                   className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600"*/}
                {/*                   role="menuitem">*/}
                {/*                    <div className="inline-flex items-center">*/}
                {/*                    <MenuSvgComponent className={"h-3.5 w-3.5 rounded-full mr-2"}/>*/}
                {/*                        Test*/}
                {/*                    </div>*/}
                {/*                </a>*/}
                {/*            </li>*/}
                {/*        </ul>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </aside>
        </div>
    );
};