import { useEffect } from "react";
import { useRef } from "react"

const useClickOutside = (handler, ignoreElement) => {
    let domNode = useRef()
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!domNode.current?.contains(event.target) &&
                !ignoreElement?.contains(event.target)) {
                handler();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [ignoreElement, handler])

    return domNode
}

export default useClickOutside;
