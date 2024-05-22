'use client'

import React, { useState } from 'react';

//import * as React from "react"
import Image from "next/image";

const OverviewSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path d="M2 10a8 8 0 0 1 8-8v8h8a8 8 0 1 1-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0 1 17.748 8H12V2.252z" />
    </svg>
)

const PagesSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 6a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H7z"
            clipRule="evenodd"
        />
    </svg>
)

const DropDownSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        aria-hidden="true"
        viewBox="0 0 3900 3900"
        {...props}
    >
        <path fill="#b22234" d="M0 0h7410v3900H0z" />
        <path
            stroke="#fff"
            strokeWidth={300}
            d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0"
        />
        <path fill="#3c3b6e" d="M0 0h2964v2100H0z" />
        <g fill="#fff">
            <g id="d">
                <g id="c">
                    <g id="e">
                        <g id="b">
                            <path
                                id="a"
                                d="m247 90 70.534 217.082-184.66-134.164h228.253L176.466 307.082z"
                            />
                            <use xlinkHref="#a" y={420} />
                            <use xlinkHref="#a" y={840} />
                            <use xlinkHref="#a" y={1260} />
                        </g>
                        <use xlinkHref="#a" y={1680} />
                    </g>
                    <use xlinkHref="#b" x={247} y={210} />
                </g>
                <use xlinkHref="#c" x={494} />
            </g>
            <use xlinkHref="#d" x={988} />
            <use xlinkHref="#c" x={1976} />
            <use xlinkHref="#e" x={2470} />
        </g>
    </svg>
)

const CarretSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
            clipRule="evenodd"
        />
    </svg>
)

const SalesSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M10 2a4 4 0 0 0-4 4v1H5a1 1 0 0 0-.994.89l-1 9A1 1 0 0 0 4 18h12a1 1 0 0 0 .994-1.11l-1-9A1 1 0 0 0 15 7h-1V6a4 4 0 0 0-4-4zm2 5V6a2 2 0 1 0-4 0v1h4zm-6 3a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm7-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
            clipRule="evenodd"
        />
    </svg>
)

const MessagesSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path d="M8.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l2-2a1 1 0 0 0-1.414-1.414L11 7.586V3a1 1 0 1 0-2 0v4.586l-.293-.293z" />
        <path d="M3 5a2 2 0 0 1 2-2h1a1 1 0 0 1 0 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 1 1 0-2h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
    </svg>
)

const AuthenticationSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm8-2v2H7V7a3 3 0 0 1 6 0z"
            clipRule="evenodd"
        />
    </svg>
)

const DocsSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path d="M9 2a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2H9z" />
        <path
            fillRule="evenodd"
            d="M4 5a2 2 0 0 1 2-2 3 3 0 0 0 3 3h2a3 3 0 0 0 3-3 2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm3 4a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2H7zm3 0a1 1 0 0 0 0 2h3a1 1 0 1 0 0-2h-3zm-3 4a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H7zm3 0a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2h-3z"
            clipRule="evenodd"
        />
    </svg>
)

const ComponentsSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path d="M7 3a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H7zM4 7a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm-2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z" />
    </svg>
)

const HelpSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 0 0 .078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913 1.58 1.58A5.98 5.98 0 0 1 10 16a5.976 5.976 0 0 1-2.516-.552l1.562-1.562a4.006 4.006 0 0 0 1.789.027zm-4.677-2.796a4.002 4.002 0 0 1-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 0 0 4 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0 1 10 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 0 0-2.346.033L7.246 4.668zM12 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
            clipRule="evenodd"
        />
    </svg>
)

const EnglishSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 512 512"
        {...props}
    >
        <g fillRule="evenodd">
            <g strokeWidth="1pt">
                <path
                    fill="#bd3d44"
                    d="M0 0h972.81v39.385H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0z"
                />
                <path
                    fill="#fff"
                    d="M0 39.385h972.81V78.77H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0zm0 78.77h972.81v39.385H0z"
                />
            </g>
            <path fill="#192f5d" d="M0 0h389.124v275.695H0z" />
            <path
                fill="#fff"
                d="m32.296 11.816 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.452 6.696 3.938 10.634-9.846-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zM64.985 39.385l3.545 11.028h11.422l-9.453 6.695 3.939 10.634-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h11.028l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm64.985 0 3.545 11.028h11.421l-9.452 6.695 3.938 10.634-9.452-6.695-9.453 6.695 3.939-10.634-9.452-6.695h11.421zm64.985 0 3.545 11.028h11.421l-9.452 6.695L269 67.742l-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h10.634l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm-291.45 27.57 3.151 11.027h11.816l-9.453 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.592 0 3.545 11.027h11.421l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zM64.985 94.523l3.545 11.028h11.422l-9.453 6.695 3.939 10.634-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h11.028l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm64.985 0 3.545 11.028h11.421l-9.058 6.695 3.544 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.452-6.695h11.421zm64.985 0 3.545 11.028h11.421l-9.452 6.695L269 122.881l-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h10.634l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm-291.45 27.57 3.151 11.027h11.816l-9.453 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.592 0 3.545 11.027h11.421l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zM64.985 149.662l3.545 11.028h11.422l-9.453 6.695 3.939 10.634-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h11.028l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm64.985 0 3.545 11.028h11.421l-9.058 6.695 3.544 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.452-6.695h11.421zm64.985 0 3.545 11.028h11.421l-9.452 6.695L269 178.02l-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h10.634l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm-291.45 27.57 3.151 11.027h11.816l-9.453 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.592 0 3.545 11.027h11.421l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zM64.985 204.802l3.545 11.028h11.422l-9.453 6.695 3.939 10.634-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h11.028l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm64.985 0 3.545 11.028h11.421l-9.058 6.695 3.544 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.452-6.695h11.421zm64.985 0 3.545 11.028h11.421l-9.452 6.695L269 233.16l-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h10.634l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm-291.45 27.57 3.151 11.027h11.816l-9.453 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.592 0 3.545 11.027h11.421l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421z"
            />
        </g>
    </svg>
)

const MenuSvgComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        aria-hidden="true"
        viewBox="0 0 512 512"
        {...props}
    >
        <defs>
            <path id="a" fill="#ffde00" d="M1-.3-.7.8 0-1 .6.8-1-.3z" />
        </defs>
        <path fill="#de2910" d="M0 0h512v512H0z" />
        <use
            xlinkHref="#a"
            width={30}
            height={20}
            transform="matrix(76.8 0 0 76.8 128 128)"
        />
        <use
            xlinkHref="#a"
            width={30}
            height={20}
            transform="rotate(-121 142.6 -47) scale(25.5827)"
        />
        <use
            xlinkHref="#a"
            width={30}
            height={20}
            transform="rotate(-98.1 198 -82) scale(25.6)"
        />
        <use
            xlinkHref="#a"
            width={30}
            height={20}
            transform="rotate(-74 272.4 -114) scale(25.6137)"
        />
        <use
            xlinkHref="#a"
            width={30}
            height={20}
            transform="matrix(16 -19.968 19.968 16 256 230.4)"
        />
    </svg>
)

//export default OverviewSvgComponent

//const [showSidebar, setShowSidebar] = useState(false);

export default function Sidebar() {
//const Sidebar = () => {
    // State to manage the open/close state of the sidebar
    //const [isOpen, setIsOpen] = useState(false);

    return (
        <aside className="fixed top-0 left-0 w-64 h-full" aria-label="Sidenav">
            <div
                className="overflow-y-auto py-5 px-3 h-full bg-red-700 border-r border-red-600 dark:bg-red-700 dark:border-red-600">
                <div style={{width: '100%', height: 'auto', position: 'relative'}}>
                    <Image
                        src = "https://www.cwu.edu/about/media-resources/brand/_images/cwu-athletics-logo.png"
                        alt = "CWU Logo"
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: '100%', height: 'auto' }} // optional
                        priority={true}
                    />
                </div>
                <ul className="space-y-2">
                    <li>
                        <a href="#"
                           className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <OverviewSvgComponent
                                className={"w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}/>
                            <span className="ml-3">Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <button type="button"
                                className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                aria-controls="dropdown-pages" data-collapse-toggle="dropdown-pages">
                            <PagesSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"}/>
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Exams</span>
                            <CarretSvgComponent className={"w-6 h-6"}/>
                        </button>
                        <ul id="dropdown-pages" className="hidden py-2 space-y-2">
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Settings</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Kanban</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Calendar</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <button type="button"
                                className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                aria-controls="dropdown-sales" data-collapse-toggle="dropdown-sales">
                            <SalesSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"} />
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Schedule</span>
                            <CarretSvgComponent className={"w-6 h-6"}/>
                        </button>
                        <ul id="dropdown-sales" className="hidden py-2 space-y-2">
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Products</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Billing</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Invoice</a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#"
                           className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <MessagesSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}/>
                            <span className="flex-1 ml-3 whitespace-nowrap">Messages</span>
                            <span
                                className="inline-flex justify-center items-center w-5 h-5 text-xs font-semibold rounded-full text-primary-800 bg-primary-100 dark:bg-primary-200 dark:text-primary-800">
                              6
                          </span>
                        </a>
                    </li>
                    <li>
                        <button type="button"
                                className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                                aria-controls="dropdown-authentication" data-collapse-toggle="dropdown-authentication">
                            <AuthenticationSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"}/>
                            <span className="flex-1 ml-3 text-left whitespace-nowrap">Authentication</span>
                            <CarretSvgComponent className={"w-6 h-6"}/>
                        </button>
                        <ul id="dropdown-authentication" className="hidden py-2 space-y-2">
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Sign
                                    In</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Sign
                                    Up</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Forgot
                                    Password</a>
                            </li>
                        </ul>
                    </li>
                </ul>
                <ul className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
                    <li>
                        <a href="#"
                           className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                            <DocsSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}/>
                            <span className="ml-3">Profile</span>
                        </a>
                    </li>
                    <li>
                        <a href="#"
                           className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                            <ComponentsSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}/>
                            <span className="ml-3">Components</span>
                        </a>
                    </li>
                    <li>
                        <a href="#"
                           className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                            <HelpSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}/>
                            <span className="ml-3">Help</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div
                className="hidden absolute bottom-0 left-0 justify-center p-4 space-x-4 w-full lg:flex bg-white dark:bg-gray-800 z-20">
                <a href="#"
                   className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
                    </svg>
                </a>
                <a href="#" data-tooltip-target="tooltip-settings"
                   className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                         xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                              clip-rule="evenodd"></path>
                    </svg>
                </a>
                <div id="tooltip-settings" role="tooltip"
                     className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip">
                    Settings page
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <button type="button" data-dropdown-toggle="language-dropdown"
                        className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:hover:text-white dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600">
                <DropDownSvgComponent className={"h-5 w-5 rounded-full mt-0.5"}/>
                </button>
                <div
                    className="hidden z-50 my-4 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700"
                    id="language-dropdown">
                    <ul className="py-1" role="none">
                        <li>
                            <a href="#"
                               className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600"
                               role="menuitem">
                                <div className="inline-flex items-center">
                                    <EnglishSvgComponent className={"h-3.5 w-3.5 rounded-full mr-2"}/>
                                    English (US)
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                               className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"
                               role="menuitem">
                                <div className="inline-flex items-center">
                                    <svg aria-hidden="true" className="h-3.5 w-3.5 rounded-full mr-2"
                                         xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-de" viewBox="0 0 512 512">
                                        <path fill="#ffce00" d="M0 341.3h512V512H0z"/>
                                        <path d="M0 0h512v170.7H0z"/>
                                        <path fill="#d00" d="M0 170.7h512v170.6H0z"/>
                                    </svg>
                                    Deutsch
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                               className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"
                               role="menuitem">
                                <div className="inline-flex items-center">
                                    <svg aria-hidden="true" className="h-3.5 w-3.5 rounded-full mr-2"
                                         xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-it" viewBox="0 0 512 512">
                                        <g fill-rule="evenodd" stroke-width="1pt">
                                            <path fill="#fff" d="M0 0h512v512H0z"/>
                                            <path fill="#009246" d="M0 0h170.7v512H0z"/>
                                            <path fill="#ce2b37" d="M341.3 0H512v512H341.3z"/>
                                        </g>
                                    </svg>
                                    Italiano
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                               className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600"
                               role="menuitem">
                                <div className="inline-flex items-center">
                                <MenuSvgComponent className={"h-3.5 w-3.5 rounded-full mr-2"}/>
                                    Test
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    );
};

//export default Sidebar;