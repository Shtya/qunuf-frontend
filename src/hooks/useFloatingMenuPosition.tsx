import { useState, useLayoutEffect, useEffect, RefObject } from 'react'

export type Align = 'left' | 'right'
export type Position = { top: number; left: number } | null

/**
 * Reuses your exact updatePosition logic,
 * runs it when `isOpen` flips on, and wires up
 * scroll/resize for live updates (RAF-throttled).
 */
export function useFloatingMenuPosition(
    anchorRef: RefObject<HTMLElement | null>,
    menuRef: RefObject<HTMLElement | null>,
    isOpen: boolean,
    width: number,
    align: Align
): Position {
    const [pos, setPos] = useState<Position>(null)

    // exact copy of updatePosition
    const updatePosition = () => {
        const anchor = anchorRef.current
        if (!anchor) return
        const rect = anchor.getBoundingClientRect()
        console.log(menuRef.current, menuRef.current?.offsetHeight)
        let left = rect.left
        if (align === 'right') {
            left = rect.right - width
        } else {
            left = rect.left
        }

        const vw = window.innerWidth
        const vh = window.innerHeight

        const clampedLeft = Math.max(8, Math.min(left, vw - width - 8))
        const top = rect.bottom + window.scrollY + 8
        const clampedTop = Math.max(8 + window.scrollY, Math.min(top, window.scrollY + vh - 40));

        setPos({ top: clampedTop, left: clampedLeft })

    }

    // run once on open/close
    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition()
        } else {
            setPos(null)
        }
    }, [isOpen])

    // watch scroll & resize, throttle with requestAnimationFrame
    useEffect(() => {
        if (!isOpen) return
        let raf = 0

        const handler = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => updatePosition())
        }

        window.addEventListener('resize', handler)
        window.addEventListener('scroll', handler, true)
        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', handler)
            window.removeEventListener('scroll', handler, true)
        }
    }, [isOpen])

    return pos
}
