"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AOSInitializer() {
    useEffect(() => {
        AOS.init({ duration: 300, easing: 'ease-in-sine', once: true, offset: 100 });
    }, []);

    return null;
}
