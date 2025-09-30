'use client'

import React, {useEffect, useState} from 'react';
import Link from "next/link";

import {useSession} from "next-auth/react";

/**
 * Overview SVG
 * @param props client props
 * @constructor
 */
const OverviewSvgComponent = (props : any) => (
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

/**
 * Pages SVG
 * @param props client props
 * @constructor
 */
const PagesSvgComponent = (props : any) => (
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

/**
 * DropDown SVG
 * @param props client props
 * @constructor
 */
const DropDownSvgComponent = (props : any) => (
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

/**
 * Carret SVG
 * @param props client props
 * @constructor
 */
const CarretSvgComponent = (props : any) => (
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

/**
 * Sales SVG
 * @param props client props
 * @constructor
 */
const SalesSvgComponent = (props : any) => (
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

/**
 * Messages SVG
 * @param props client props
 * @constructor
 */
const MessagesSvgComponent = (props : any) => (
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

/**
 * Authentication SVG
 * @param props client props
 * @constructor
 */
const AuthenticationSvgComponent = (props : any) => (
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

/**
 * Docs SVG
 * @param props client props
 * @constructor
 */
const DocsSvgComponent = (props : any) => (
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

/**
 * Component SVG
 * @param props client props
 * @constructor
 */
const ComponentsSvgComponent = (props : any) => (
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

/**
 * Help SVG
 * @param props client props
 * @constructor
 */
const HelpSvgComponent = (props : any) => (
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

/**
 * English Language SVG
 * @param props client props
 * @constructor
 */
const EnglishSvgComponent = (props : any) => (
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
                d="m32.296 11.816 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.846-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zM64.985 39.385l3.545 11.028h11.422l-9.453 6.695 3.939 10.634-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h11.028l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm64.985 0 3.545 11.028h11.421l-9.058 6.695 3.544 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.452-6.695h11.421zm64.985 0 3.545 11.028h11.421l-9.452 6.695L269 67.742l-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h10.634l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm-291.45 27.57 3.151 11.027h11.816l-9.453 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.592 0 3.545 11.027h11.421l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zM64.985 94.523l3.545 11.028h11.422l-9.453 6.695 3.939 10.634-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h11.028l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm64.985 0 3.545 11.028h11.421l-9.058 6.695 3.544 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.452-6.695h11.421zm64.985 0 3.545 11.028h11.421l-9.452 6.695L269 122.881l-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h10.634l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm-291.45 27.57 3.151 11.027h11.816l-9.453 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.592 0 3.545 11.027h11.421l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zM64.985 149.662l3.545 11.028h11.422l-9.453 6.695 3.939 10.634-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h11.028l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm64.985 0 3.545 11.028h11.421l-9.058 6.695 3.544 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.452-6.695h11.421zm64.985 0 3.545 11.028h11.421l-9.452 6.695L269 178.02l-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h10.634l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm-291.45 27.57 3.151 11.027h11.816l-9.453 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.592 0 3.545 11.027h11.421l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421zM64.985 204.802l3.545 11.028h11.422l-9.453 6.695 3.939 10.634-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h11.028l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm64.985 0 3.545 11.028h11.421l-9.058 6.695 3.544 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.452-6.695h11.421zm64.985 0 3.545 11.028h11.421l-9.452 6.695L269 233.16l-9.453-6.695-9.452 6.695 3.938-10.634-9.452-6.695h11.422zm64.592 0 3.938 11.028h10.634l-9.059 6.695 3.545 10.634-9.452-6.695-9.059 6.695 3.545-10.634-9.453-6.695h11.816zm-291.45 27.57 3.151 11.027h11.816l-9.453 6.696 3.545 10.634-9.452-6.696-8.665 6.696 3.545-10.634-9.453-6.696H29.54zm64.592 0 3.545 11.027h11.421l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.939 10.634-9.453-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.422zm64.592 0 3.938 11.027h11.028l-9.059 6.696 3.545 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.453-6.696h11.816zm64.985 0 3.544 11.027h11.422l-9.058 6.696 3.544 10.634-9.452-6.696-9.059 6.696 3.545-10.634-9.452-6.696h11.421zm64.985 0 3.545 11.027h11.421l-9.452 6.696 3.938 10.634-9.452-6.696-9.452 6.696 3.938-10.634-9.452-6.696h11.421z"
            />
        </g>
    </svg>
)

/**
 * Italian Language SVG
 * @param props client props
 * @constructor
 */
const ItalianSvgComponent = (props : any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 512 512"
        {...props}
    >
        <g fillRule="evenodd" strokeWidth="1pt">
            <path fill="#fff" d="M0 0h512v512H0z" />
            <path fill="#009246" d="M0 0h170.7v512H0z" />
            <path fill="#ce2b37" d="M341.3 0H512v512H341.3z" />
        </g>
    </svg>
)

/**
 * German Language SVG
 * @param props client props
 * @constructor
 */
const GermanSvgComponent = (props : any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 512 512"
        {...props}
    >
        <path fill="#ffce00" d="M0 341.3h512V512H0z" />
        <path d="M0 0h512v170.7H0z" />
        <path fill="#d00" d="M0 170.7h512v170.6H0z" />
    </svg>
)

/**
 * Menu SVG
 * @param props client props
 * @constructor
 */
const MenuSvgComponent = (props : any) => (
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

/**
 * Sider SVG
 * @param props client props
 * @constructor
 */
const SliderSvgComponent = (props : any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path d="M5 4a1 1 0 0 0-2 0v7.268a2 2 0 0 0 0 3.464V16a1 1 0 1 0 2 0v-1.268a2 2 0 0 0 0-3.464V4zm6 0a1 1 0 1 0-2 0v1.268a2 2 0 0 0 0 3.464V16a1 1 0 1 0 2 0V8.732a2 2 0 0 0 0-3.464V4zm5-1a1 1 0 0 1 1 1v7.268a2 2 0 0 1 0 3.464V16a1 1 0 1 1-2 0v-1.268a2 2 0 0 1 0-3.464V4a1 1 0 0 1 1-1z" />
    </svg>
)

/**
 * Settings SVG
 * @param props client props
 * @constructor
 */
const SettingsSvgComponent = (props : any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        aria-hidden="true"
        viewBox="0 0 20 20"
        {...props}
    >
        <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
            clipRule="evenodd"
        />
    </svg>
)

/**
 * Hamburger SVG
 * @param props client props
 * @constructor
 */
const HamburgerSvgComponent = (props : any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width={800}
        height={800}
        viewBox="0 0 32 32"
        {...props}
    >
        <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            strokeWidth={2}
            d="M7 16h18M7 25h18M7 7h18"
        />
    </svg>
)

/**
 * Default Sidebar Navigation Component
 * @constructor
 */
export default function Sidebar() {
    // State to manage the open/close state of the sidebar
    const [isOpen, setIsOpen] = useState(true);
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

    /**
     * Collapse and Uncollapse Toggle event
     * @param e DOM event
     */
    const sidebarHandler = async (e : any) => {
        e.preventDefault();
        // console.log('Sidebar Handler');

        // Get the elements to modify
        var parent = document.getElementById('sidebar');
        var middle = document.getElementById('sidebar-middle');
        var bottom = document.getElementById('sidebar-bottom');
        var hamburgerSlider = document.getElementById('hgSlider');
        var hamburgerSliderBlock = document.getElementById('hgslider-block');
        var hamburgerSliderParent = document.getElementById('hgslider-parent');
        var sidebarBox = document.getElementById('sidebar-box');
        var mainBox = document.getElementById('mainbar-box');

        // Only handle if elements exists
        if (parent != null && middle != null && bottom != null && hamburgerSlider != null
                && hamburgerSliderBlock != null && hamburgerSliderParent != null
                && sidebarBox != null && mainBox != null) {
            // Determine current sidebar status
            if (isOpen) {
                setIsOpen(false);
                // Main sidebar collapse
                // Adjust the sidebar colors
                parent.classList.remove("bg-gradient-to-r");
                parent.classList.remove("from-crimson");
                parent.classList.remove("via-zinc-900");
                parent.classList.remove("to-mentat-black");
                parent.classList.add("bg-mentat-black")
                // hamburgerSliderBlock.classList.remove("bg-gradient-to-r");
                // hamburgerSliderBlock.classList.remove("from-crimson");
                // hamburgerSliderBlock.classList.remove("via-zinc-900");
                // hamburgerSliderBlock.classList.remove("to-neutral-950");
                hamburgerSliderBlock.classList.add("bg-mentat-black");

                // Shift the hamburger into absolute position
                hamburgerSliderParent.classList.add("absolute")
                hamburgerSliderParent.classList.add("bg-mentat-black");

                // Bottom element visibility
                bottom.classList.add("invisible")

                // Middle element visibility
                middle.classList.add("invisible");

                // Update rounded status
                hamburgerSliderBlock.classList.add("rounded-xl");
                hamburgerSliderParent.classList.add("rounded-xl");

                // Update the box sizes
                sidebarBox.classList.remove("w-64")
                sidebarBox.classList.add("w-4")
                sidebarBox.classList.add("h-4")
                mainBox.classList.remove("w-auto")
                mainBox.classList.add("w-full")
            } else {
                setIsOpen(true);
                // Main sidebar uncollapse
                // Adjust the sidebar colors
                parent.classList.remove("bg-mentat-black")
                parent.classList.add("bg-gradient-to-br");
                parent.classList.add("from-crimson");
                parent.classList.add("via-zinc-900");
                parent.classList.add("to-mentat-black");
                hamburgerSliderBlock.classList.remove("bg-mentat-black");

                // Normalize the hamburger
                hamburgerSliderParent.classList.remove("absolute")
                hamburgerSliderParent.classList.remove("bg-mentat-black");

                // Bottom element visibility
                bottom.classList.remove("invisible")

                // Middle element visibility
                middle.classList.remove("invisible");

                // Update the rounded corners
                hamburgerSliderBlock.classList.remove("rounded-xl");
                hamburgerSliderParent.classList.remove("rounded-xl");

                // Update the box sizes for sidebar and mainbox
                sidebarBox.classList.remove("w-4")
                sidebarBox.classList.remove("h-4")
                sidebarBox.classList.add("w-64")
                mainBox.classList.remove("w-full")
                mainBox.classList.add("w-auto")
            }
        }
    }

    return (
        <aside 
            id="sidebar" 
            // className="h-full w-full flex flex-col transition-[width] ease-in-out delay-50 bg-crimson"
            className="h-full w-full flex flex-col transition-[width]
                    ease-in-out delay-50 bg-gradient-to-br
                    from-crimson  via-zinc-900 to-mentat-black"
            aria-label="Sidenav"
        >
            {/* Put back the entire hgslider-block as this is REQUIRED for collapse animations*/}
            <div id="sidebar-header">
                {/* Floating slider box */}
                <div
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

                    <div id="hgslider-parent" className="inline-block">
                        <a
                            href="#"
                            onClick={sidebarHandler}
                            className="group flex items-center p-2 text-base font-normal text-white rounded-lg hover:bg-crimson-700 group"
                        >
                            <HamburgerSvgComponent
                                className={`
                                    w-4 h-4 text-white transition-all duration-150 group-hover:bg-crimson-700
                                    ${isOpen ? 'zinc-900 rotate-0' : 'bg-mentat-black rotate-180'}
                                  `}
                            />
                        </a>
                    </div>
                </div>
            </div>

            {/* Menu selections and details */}
            <div 
                id="sidebar-middle" 
                className="flex-1 overflow-y-auto pb-5 px-3"
            >
                <ul className="space-y-2">
                    <li>
                        <Link href="/dashboard"
                           className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                                    dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <OverviewSvgComponent
                                className="w-6 h-6 text-mentat-gold transition duration-75 dark:text-gray-400
                                group-hover:text-gray-900 dark:group-hover:text-white"/>
                            <span className="ml-3">Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/grades"
                           className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg
                                    dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                            <PagesSvgComponent
                                className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75
                                    group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"/>
                            <span className="ml-3">{userType === 'Student' ? 'Grades' : 'Exams'}</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/schedule"
                                className="flex items-center p-2 w-full text-base font-normal text-yellow-300 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                            <SalesSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"}/>
                            <span className="ml-3">{userType === 'Student' ? 'Schedule Exam' : 'Create Test Window'}</span>
                        </Link>
                    </li>
                    {/*<li>*/}
                    {/*    <Link href="/exams"*/}
                    {/*          className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">*/}
                    {/*        <MessagesSvgComponent*/}
                    {/*            className={"flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"}/>*/}
                    {/*        <span className="flex-1 ml-3 whitespace-nowrap">Exams</span>*/}
                    {/*    </Link>*/}
                    {/*</li>*/}
                    <li>
                        <Link href="/reports"
                              className="flex items-center p-2 w-full text-base font-normal text-yellow-300 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                            <AuthenticationSvgComponent
                                className={"flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"}/>
                            <span className="ml-3">Reports</span>
                        </Link>
                        {/*<ul id="dropdown-authentication" className="hidden py-2 space-y-2">*/}
                        {/*    <li>*/}
                        {/*        <a href="#"*/}
                        {/*           className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Sign*/}
                        {/*            In</a>*/}
                        {/*    </li>*/}
                        {/*    <li>*/}
                        {/*        <a href="#"*/}
                        {/*           className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Sign*/}
                        {/*            Up</a>*/}
                        {/*    </li>*/}
                        {/*    <li>*/}
                        {/*        <a href="#"*/}
                        {/*           className="flex items-center p-2 pl-11 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Forgot*/}
                        {/*            Password</a>*/}
                        {/*    </li>*/}
                        {/*</ul>*/}
                    </li>
                </ul>
                <ul className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
                    <li>
                        <a href="#"
                           className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg transition
                                duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group disabled">
                            <DocsSvgComponent
                                className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75 dark:text-gray-400
                                    group-hover:text-gray-900 dark:group-hover:text-white"/>
                            <span className="ml-3">Profile</span>
                        </a>
                    </li>
                    <li>
                        <a href="#"
                           className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg transition
                                duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group disabled">
                            <ComponentsSvgComponent
                                className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75 dark:text-gray-400
                                    group-hover:text-gray-900 dark:group-hover:text-white"/>
                            <span className="ml-3">Administration</span>
                        </a>
                    </li>
                    <li>
                        <a href="#"
                           className="flex items-center p-2 text-base font-normal text-yellow-300 rounded-lg transition
                                duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group disabled">
                            <HelpSvgComponent
                                className="flex-shrink-0 w-6 h-6 text-mentat-gold transition duration-75 dark:text-gray-400
                                    group-hover:text-gray-900 dark:group-hover:text-white"/>
                            <span className="ml-3">Help</span>
                        </a>
                    </li>
                </ul>
                {/* Line Divider */}
                <hr className="border-white mt-5"></hr>
                {/* Date/Time Section */}
                <div className="text-mentat-gold px-4 mt-5">
                    <div>Today's Date: <span id="date">{currDate}</span></div>
                    <div>Current Time: <span id="time">{currTime}</span></div>
                </div>
                {/* Line Divider */}
                <hr className="border-white mt-5"></hr>
                {/* User Info & Actions */}
                <div className="items-center px-4 mt-5 space-x-4">
                    {session ? (
                        <div className="text-mentat-gold text-sm">
                            <p>Email: {session?.user?.email}</p>
                            <p>Username: {session?.user?.username}</p>
                            <p>Role: {userType}</p>
                        </div>
                    ) : null}
                </div>
            </div>
            <div id="sidebar-bottom"
                className="hidden bottom-0 left-0 justify-center p-4 space-x-4 w-full lg:flex bg-white dark:bg-gray-800 z-20">
                <a href="#"
                   className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400
                        hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600 disabled">
                   <SliderSvgComponent className="w-6 h-6"/>
                </a>
                <a href="#" data-tooltip-target="tooltip-settings"
                   className="inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400
                        dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600 disabled">
                    <SettingsSvgComponent className="w-6 h-6"/>
                </a>
                <div id="tooltip-settings" role="tooltip"
                     className="inline-block absolute invisible z-10 py-2 px-3 text-sm font-medium text-white bg-gray-900
                        rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip disabled">
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
                                    <GermanSvgComponent className="h-3.5 w-3.5 rounded-full mr-2"/>
                                    Deutsch
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="#"
                               className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"
                               role="menuitem">
                                <div className="inline-flex items-center">
                                    <ItalianSvgComponent className="h-3.5 w-3.5 rounded-full mr-2"/>
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