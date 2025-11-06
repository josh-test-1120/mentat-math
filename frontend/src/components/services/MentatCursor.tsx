/**
 * This is a highly optimized cursor component which relies on
 * CSS for all animations and transformations
 * This removes any delay from state variables or alternative
 * React mechanics
 * @author Joshua Summers
 */
'use client';

import { useEffect, useRef } from 'react';
import {
    Pi,
    LucideSigma,
    Omega,
    MousePointer2,
    InfinityIcon,
    EqualApproximately,
    EqualNot,
    PercentIcon
} from 'lucide-react';

// Icons to be shown
type IconType = 'pointer' | 'pi' | 'sigma' | 'omega' | 'infinity' | 'approximate' | 'notequal' | 'modulo';

// Sequencer for animations
const IDLE_ICON_SEQUENCE: IconType[] = ['pi', 'sigma', 'omega', 'infinity', 'approximate', 'notequal', 'modulo'];

/**
 * This is the mentat cursor component
 * @constructor
 */
export default function MentatCursor() {
    // Cursor state references
    const cursorRef = useRef<HTMLDivElement>(null);
    const rippleRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef({ x: 0, y: 0 });
    const currentIconRef = useRef<IconType>('pointer');
    const isIdleRef = useRef(false);
    const idleTimerRef = useRef<NodeJS.Timeout>();
    const animationTimerRef = useRef<NodeJS.Timeout>();

    // Mouse tracking - pure DOM manipulation to reduce performance impact
    useEffect(() => {
        const cursor = cursorRef.current;
        const ripple = rippleRef.current;
        if (!cursor || !ripple) return;

        // Hide the system cursor
        document.body.style.cursor = 'none';

        // Mouse movement updates
        const handleMouseMove = (e: MouseEvent) => {
            // Update the location
            positionRef.current = { x: e.clientX, y: e.clientY };
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursor.style.display = 'block';

            // Also update ripple position
            ripple.style.left = e.clientX + 'px';
            ripple.style.top = e.clientY + 'px';

            // Switch back to pointer icon when moving (default cursor)
            currentIconRef.current = 'pointer';
            cursor.dataset.currentIcon = 'pointer';

            // Stop any CSS animation immediately (on move)
            cursor.classList.remove('cursor-idle-animating');

            // Reset idle state
            isIdleRef.current = false;
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

            // Set idle timer
            idleTimerRef.current = setTimeout(() => {
                isIdleRef.current = true;
                // Wait before starting first transition
                setTimeout(startIdleAnimation, 4000);
            }, 4000);
        };

        // Mouse click (down press) updates
        const handleMouseDown = () => {
            // Local constants of the references
            const cursor = cursorRef.current;
            const ripple = rippleRef.current;
            if (!cursor || !ripple) return;

            // Add click effect to container (for the icons)
            cursor.classList.add('cursor-click');

            // Update ripple position to pointer tip
            const tipOffset = 10;
            ripple.style.left = (positionRef.current.x - tipOffset) + 'px';
            ripple.style.top = (positionRef.current.y - tipOffset) + 'px';

            // Trigger ripple effect
            ripple.classList.add('ripple-active');
            setTimeout(() => {
                ripple.classList.remove('ripple-active');
            }, 600);

            setTimeout(() => {
                cursor.classList.remove('cursor-click');
            }, 150);
        };

        // Animation handler for idle icon animations
        const startIdleAnimation = () => {
            if (!isIdleRef.current) return;

            // Start CSS animation
            cursor.classList.add('cursor-idle-animating');

            // Set up next transition after animation completes
            animationTimerRef.current = setTimeout(() => {
                if (isIdleRef.current) {
                    // Get current index and next icon
                    const currentIndex = IDLE_ICON_SEQUENCE.indexOf(currentIconRef.current as any);
                    const nextIndex = currentIndex >= 0 ?
                        (currentIndex + 1) % IDLE_ICON_SEQUENCE.length : 0;

                    // Update to next icon
                    currentIconRef.current = IDLE_ICON_SEQUENCE[nextIndex];
                    cursor.dataset.currentIcon = currentIconRef.current;

                    // Remove animation class to reset for next time
                    cursor.classList.remove('cursor-idle-animating');

                    // Wait before next transition
                    if (isIdleRef.current) {
                        // Random delay between 4-6 seconds
                        const nextDelay = 4000 + Math.random() * 2000;
                        animationTimerRef.current = setTimeout(startIdleAnimation, nextDelay);
                    }
                }
            }, 2000);
        };

        // Update cursor for interactive elements
        const updateCursorForElement = (target: EventTarget | null) => {
            if (!cursor) return;

            const element = target as HTMLElement;
            if (!element) return;

            // Check if element is clickable
            const isClickable =
                element.tagName === 'BUTTON' ||
                element.tagName === 'A' ||
                element.onclick !== null ||
                element.style.cursor === 'pointer' ||
                element.classList.contains('cursor-pointer');

            if (isClickable) {
                cursor.classList.add('cursor-clickable');
            } else {
                cursor.classList.remove('cursor-clickable');
            }
        };

        // Mouse hover events
        const handleMouseOver = (e: MouseEvent) => {
            updateCursorForElement(e.target);
        };

        // Add the event listeners for mouse actions
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseover', handleMouseOver);

        // Cleanup handler
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseover', handleMouseOver);
            // restore system cursor when component cleans up
            document.body.style.cursor = 'auto';
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
        };
    }, []);

    const currentIcon = currentIconRef.current;

    return (
        <>
            <div
                ref={cursorRef}
                className="fixed pointer-events-none z-50 cursor-container"
                style={{
                    left: `${positionRef.current.x}px`,
                    top: `${positionRef.current.y}px`,
                }}
                data-current-icon={currentIcon}
            >
                <div className="cursor-scale-wrapper">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        {/* All icons rendered once, CSS handles visibility */}
                        <div className="cursor-icon cursor-icon-pointer">
                            <MousePointer2
                                size={28}
                                className="text-mentat-gold"
                                strokeWidth="0.75"
                                stroke="#8e0d2b"
                                fill="currentColor"
                            />
                        </div>
                        <div className="cursor-icon cursor-icon-pi">
                            <Pi size={28} className="text-mentat-gold" />
                        </div>
                        <div className="cursor-icon cursor-icon-sigma">
                            <LucideSigma size={28} className="text-mentat-gold" />
                        </div>
                        <div className="cursor-icon cursor-icon-omega">
                            <Omega size={28} className="text-mentat-gold" />
                        </div>
                        <div className="cursor-icon cursor-icon-infinity">
                            <InfinityIcon size={28} className="text-mentat-gold" />
                        </div>
                        <div className="cursor-icon cursor-icon-approximate">
                            <EqualApproximately size={28} className="text-mentat-gold" />
                        </div>
                        <div className="cursor-icon cursor-icon-notequal">
                            <EqualNot size={28} className="text-mentat-gold" />
                        </div>
                        <div className="cursor-icon cursor-icon-modulo">
                            <PercentIcon size={28} className="text-mentat-gold" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ripple element */}
            <div
                ref={rippleRef}
                className="fixed pointer-events-none z-40 ripple-element"
                style={{
                    left: `${positionRef.current.x}px`,
                    top: `${positionRef.current.y}px`,
                }}
            />

            {/* Because sometimes raw CSS is the fastest way */}
            {/* Comprehensive CSS for all animation states */}
            <style jsx global>{`
                /* Hide the system cursor */
                body, body * {
                    cursor: none !important;
                }

                /* Container positioning */
                .cursor-container {
                    transition: transform 0.15s ease-in-out;
                }
                
                /* Icon settings */
                .cursor-icon {
                    position: absolute;
                    top: 0;
                    left: 0;
                    opacity: 0;
                    transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
                    transform: scale(1);
                    filter: blur(0px);
                }

                /* Show current icon based on data attribute */
                .cursor-container[data-current-icon="pointer"] .cursor-icon-pointer,
                .cursor-container[data-current-icon="pi"] .cursor-icon-pi,
                .cursor-container[data-current-icon="sigma"] .cursor-icon-sigma,
                .cursor-container[data-current-icon="omega"] .cursor-icon-omega,
                .cursor-container[data-current-icon="infinity"] .cursor-icon-infinity,
                .cursor-container[data-current-icon="approximate"] .cursor-icon-approximate,
                .cursor-container[data-current-icon="notequal"] .cursor-icon-notequal,
                .cursor-container[data-current-icon="modulo"] .cursor-icon-modulo {
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(0px);
                }

                /* Red border drop shadow for default cursor only */
                .cursor-container[data-current-icon="pointer"] .cursor-icon-pointer svg {
                    filter:
                            drop-shadow(0.50px 0 0 #8e0d2b)
                            drop-shadow(-0.50px 0 0 #8e0d2b)
                            drop-shadow(0 0.50px 0 #8e0d2b)
                            drop-shadow(0 -0.50px 0 #8e0d2b);
                }

                /* Movement on container */
                .cursor-container.cursor-click {
                    transform: translate(-4px, -4px) !important; /* Subtle 2px movement */
                }

                /* Scaling on the wrapper */
                .cursor-scale-wrapper {
                    transition: transform 0.15s ease-in-out;
                }

                /* Click effect - icon scaling with high specificity */
                .cursor-container.cursor-click .cursor-scale-wrapper {
                    transform: scale(0.80) !important;
                }

                /* Override active states during click */
                .cursor-container.cursor-click[data-current-icon="pointer"] .cursor-icon-pointer,
                .cursor-container.cursor-click[data-current-icon="pi"] .cursor-icon-pi,
                .cursor-container.cursor-click[data-current-icon="sigma"] .cursor-icon-sigma,
                .cursor-container.cursor-click[data-current-icon="omega"] .cursor-icon-omega,
                .cursor-container.cursor-click[data-current-icon="infinity"] .cursor-icon-infinity,
                .cursor-container.cursor-click[data-current-icon="approximate"] .cursor-icon-approximate,
                .cursor-container.cursor-click[data-current-icon="notequal"] .cursor-icon-notequal,
                .cursor-container.cursor-click[data-current-icon="modulo"] .cursor-icon-modulo {
                    transform: scale(0.80) !important;
                }

                /* Clickable state - combines red border with gold glow */
                .cursor-clickable .cursor-icon-pointer svg {
                    filter:
                            drop-shadow(1px 0 0 #A30F32)
                            drop-shadow(-1px 0 0 #A30F32)
                            drop-shadow(0 1px 0 #A30F32)
                            drop-shadow(0 -1px 0 #A30F32)
                            drop-shadow(0 0 0.25px rgba(251, 191, 36, 0.5));
                }

                /* Lighter gold coloring */
                .cursor-clickable .cursor-icon-pointer {
                    color: #FBBF24 !important;
                }

                /* Ripple effect styles - positioned at pointer tip */
                .ripple-element {
                    width: 10px;
                    height: 10px;
                    border-radius: 80%;
                    background: rgba(163, 15, 50, 0.3);
                    opacity: 0;
                    transform: translate(10px, 10px) scale(1); /* Offset to pointer tip */
                    display: block !important;
                    pointer-events: none !important;
                    z-index: 30 !important;
                }

                /* Ripple animation */
                .ripple-element.ripple-active {
                    animation: ripple 0.6s ease-out forwards !important;
                }

                /* Ripple animation keyframes */
                @keyframes ripple {
                    0% {
                        transform: translate(10px, 10px) scale(1); /* Start at tip */
                        opacity: 0.7;
                    }
                    50% {
                        opacity: 0.4;
                    }
                    100% {
                        transform: translate(10px, 10px) scale(4); /* Expand from tip */
                        opacity: 0;
                    }
                }

                /* Dramatic idle animation */
                .cursor-idle-animating {
                    animation: cursorFloat 2.0s ease-in-out;
                }

                /* Floating effect during transitions */
                @keyframes cursorFloat {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    25% {
                        transform: translateY(-3px);
                    }
                    75% {
                        transform: translateY(2px);
                    }
                }

                /* Smooth transitions from pointer to first icon and between icons */
                .cursor-idle-animating[data-current-icon="pointer"] .cursor-icon-pointer {
                    animation: dramaticFadeOut 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .cursor-idle-animating[data-current-icon="pointer"] .cursor-icon-pi {
                    animation: dramaticFadeIn 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .cursor-idle-animating[data-current-icon="pi"] .cursor-icon-pi {
                    animation: dramaticFadeOut 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .cursor-idle-animating[data-current-icon="pi"] .cursor-icon-sigma {
                    animation: dramaticFadeIn 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .cursor-idle-animating[data-current-icon="sigma"] .cursor-icon-sigma {
                    animation: dramaticFadeOut 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .cursor-idle-animating[data-current-icon="sigma"] .cursor-icon-omega {
                    animation: dramaticFadeIn 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .cursor-idle-animating[data-current-icon="omega"] .cursor-icon-omega {
                    animation: dramaticFadeOut 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .cursor-idle-animating[data-current-icon="omega"] .cursor-icon-infinity {
                    animation: dramaticFadeIn 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .cursor-idle-animating[data-current-icon="infinity"] .cursor-icon-infinity {
                    animation: dramaticFadeOut 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .cursor-idle-animating[data-current-icon="infinity"] .cursor-icon-approximate {
                    animation: dramaticFadeIn 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .cursor-idle-animating[data-current-icon="approximate"] .cursor-icon-approximate {
                    animation: dramaticFadeOut 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .cursor-idle-animating[data-current-icon="approximate"] .cursor-icon-notequal {
                    animation: dramaticFadeIn 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .cursor-idle-animating[data-current-icon="notequal"] .cursor-icon-notequal {
                    animation: dramaticFadeOut 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .cursor-idle-animating[data-current-icon="notequal"] .cursor-icon-modulo {
                    animation: dramaticFadeIn 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .cursor-idle-animating[data-current-icon="modulo"] .cursor-icon-modulo {
                    animation: dramaticFadeOut 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .cursor-idle-animating[data-current-icon="modulo"] .cursor-icon-pi {
                    animation: dramaticFadeIn 2.0s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                /* Dramatic fade out with scale down and blur */
                @keyframes dramaticFadeOut {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                        filter: blur(0px);
                    }
                    30% {
                        opacity: 0.8;
                        transform: scale(1.1);
                        filter: blur(1px);
                    }
                    60% {
                        opacity: 0.3;
                        transform: scale(0.9);
                        filter: blur(2px);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.8);
                        filter: blur(3px);
                    }
                }

                /* Dramatic fade in with scale up and blur */
                @keyframes dramaticFadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(1.2);
                        filter: blur(3px);
                    }
                    40% {
                        opacity: 0.2;
                        transform: scale(1.1);
                        filter: blur(2px);
                    }
                    70% {
                        opacity: 0.7;
                        transform: scale(0.95);
                        filter: blur(1px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                        filter: blur(0px);
                    }
                }

                /* Hide non-active icons during transitions */
                .cursor-idle-animating[data-current-icon="pointer"] .cursor-icon-sigma,
                .cursor-idle-animating[data-current-icon="pointer"] .cursor-icon-omega,
                .cursor-idle-animating[data-current-icon="pointer"] .cursor-icon-infinity,
                .cursor-idle-animating[data-current-icon="pointer"] .cursor-icon-approximate,
                .cursor-idle-animating[data-current-icon="pointer"] .cursor-icon-notequal,
                .cursor-idle-animating[data-current-icon="pointer"] .cursor-icon-modulo,
                .cursor-idle-animating[data-current-icon="pi"] .cursor-icon-pointer,
                .cursor-idle-animating[data-current-icon="pi"] .cursor-icon-modulo,
                .cursor-idle-animating[data-current-icon="sigma"] .cursor-icon-pointer,
                .cursor-idle-animating[data-current-icon="sigma"] .cursor-icon-pi,
                .cursor-idle-animating[data-current-icon="omega"] .cursor-icon-pointer,
                .cursor-idle-animating[data-current-icon="omega"] .cursor-icon-sigma,
                .cursor-idle-animating[data-current-icon="infinity"] .cursor-icon-pointer,
                .cursor-idle-animating[data-current-icon="infinity"] .cursor-icon-omega,
                .cursor-idle-animating[data-current-icon="approximate"] .cursor-icon-pointer,
                .cursor-idle-animating[data-current-icon="approximate"] .cursor-icon-infinity,
                .cursor-idle-animating[data-current-icon="notequal"] .cursor-icon-pointer,
                .cursor-idle-animating[data-current-icon="notequal"] .cursor-icon-modulo,
                .cursor-idle-animating[data-current-icon="modulo"] .cursor-icon-pointer,
                .cursor-idle-animating[data-current-icon="modulo"] .cursor-icon-pi {
                    opacity: 0;
                    animation: none;
                }
            `}</style>
        </>
    );
}