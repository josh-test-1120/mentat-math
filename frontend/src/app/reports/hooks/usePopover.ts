// hooks/usePopover.ts
import { useState, useRef, useCallback } from 'react';

export const usePopover = (hoverDelay: number = 1000) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [closeOnMouseLeave, setCloseOnMouseLeave] = useState(true);
    const hoverTimeoutRef = useRef<NodeJS.Timeout>();
    const leaveTimeoutRef = useRef<NodeJS.Timeout>();
    const triggerRef = useRef<HTMLDivElement>(null);

    const showPopover = useCallback((event?: React.MouseEvent, closeOnLeave: boolean = true) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
        }

        // Get position from event OR from triggerRef
        let rect: DOMRect;
        if (event && event.currentTarget) {
            rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        } else if (triggerRef.current) {
            rect = triggerRef.current.getBoundingClientRect();
        } else {
            // Fallback to center of screen
            rect = {
                left: window.innerWidth / 2,
                top: window.innerHeight / 2,
                width: 0,
                height: 0
            } as DOMRect;
        }

        setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10 // Position above the card
        });

        setCloseOnMouseLeave(closeOnLeave);
        setIsVisible(true);
    }, []);

    const hidePopover = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
        }
        setIsVisible(false);
        setCloseOnMouseLeave(true); // Reset to default
    }, []);

    const handleMouseEnter = useCallback((event: React.MouseEvent) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        hoverTimeoutRef.current = setTimeout(() => {
            showPopover(event, true); // Hover-opened popovers close on mouse leave
        }, hoverDelay);
    }, [hoverDelay, showPopover]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        // Only auto-close if the popover was opened via hover (not click)
        if (isVisible && closeOnMouseLeave) {
            leaveTimeoutRef.current = setTimeout(() => {
                hidePopover();
            }, 300); // Small delay before closing to allow moving to popover
        }
    }, [isVisible, closeOnMouseLeave, hidePopover]);

    const handleClick = useCallback((event: React.MouseEvent) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
        }

        // Click-opened popovers don't close on mouse leave
        showPopover(event, false);
    }, [showPopover]);

    // Handle mouse leave from the popover itself
    const handlePopoverMouseLeave = useCallback(() => {
        if (closeOnMouseLeave) {
            leaveTimeoutRef.current = setTimeout(() => {
                hidePopover();
            }, 300);
        }
    }, [closeOnMouseLeave, hidePopover]);

    const handlePopoverMouseEnter = useCallback(() => {
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
        }
    }, []);

    return {
        isVisible,
        position,
        triggerRef,
        handleMouseEnter,
        handleMouseLeave,
        handleClick,
        hidePopover,
        handlePopoverMouseEnter,
        handlePopoverMouseLeave
    };
};