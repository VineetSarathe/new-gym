import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

// Per website strategy doc: "Top navigation: Logo | Projects | Services | About | Contact"
const NAV_LINKS = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#approach" },
    { label: "Work", href: "#projects" },
    { label: "Resources", href: "#about" },
    { label: "Company", href: "#about" },
    { label: "Partners", href: "#about" },
];

// Injects the 3-role brand type system (display / editorial / body)
// and a systematic set of utility classes, without touching index.css
function useBrandFonts() {
    useEffect(() => {
        if (!document.getElementById("dd-fonts")) {
            const link = document.createElement("link");
            link.id = "dd-fonts";
            link.rel = "stylesheet";
            link.href =
                "https://fonts.googleapis.com/css2?family=Anton&family=Cormorant+Garamond:ital,wght@0,500;1,500;1,600&family=Inter:wght@400;500;600;700;800&display=swap";
            document.head.appendChild(link);
        }
        if (!document.getElementById("dd-font-classes")) {
            const style = document.createElement("style");
            style.id = "dd-font-classes";
            style.textContent = `
        .font-display { font-family: 'Anton', sans-serif; letter-spacing: 0.01em; }
        .font-editorial { font-family: 'Cormorant Garamond', serif; font-style: italic; }
        .font-body { font-family: 'Inter', sans-serif; }
      `;
            document.head.appendChild(style);
        }
    }, []);
}

export default function Navbar() {
    useBrandFonts();

    const [menuOpen, setMenuOpen] = useState(false);
    const [onLight, setOnLight] = useState(false);
    const navRef = useRef(null);
    const menuRef = useRef(null);

    useGSAP(() => {
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReduced) return;
        gsap.fromTo(
            navRef.current,
            { y: -32, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.15 }
        );
    }, []);

    useGSAP(
        () => {
            if (!menuRef.current) return;
            const links = menuRef.current.querySelectorAll("[data-menu-link]");
            const tl = gsap.timeline({ paused: true });
            tl.set(menuRef.current, { display: "flex" })
                .fromTo(
                    menuRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.35, ease: "power2.out" }
                )
                .fromTo(
                    links,
                    { y: 24, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" },
                    "-=0.15"
                );

            if (menuOpen) {
                tl.play(0);
            } else {
                gsap.to(menuRef.current, {
                    opacity: 0,
                    duration: 0.25,
                    ease: "power2.in",
                    onComplete: () => {
                        if (menuRef.current) menuRef.current.style.display = "none";
                    },
                });
            }
        },
        { dependencies: [menuOpen] }
    );

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    useEffect(() => {
        const intersecting = new Set();
        let observer;

        const connect = () => {
            observer?.disconnect();
            intersecting.clear();
            const headerH = navRef.current?.offsetHeight || 80;
            const bottomInset = Math.max(0, window.innerHeight - headerH);
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) intersecting.add(entry.target);
                        else intersecting.delete(entry.target);
                    });
                    setOnLight(intersecting.size > 0);
                },
                {
                    root: null,
                    rootMargin: `0px 0px -${bottomInset}px 0px`,
                    threshold: 0,
                }
            );
            document.querySelectorAll("[data-nav-light]").forEach((el) => {
                observer.observe(el);
            });
        };

        connect();
        window.addEventListener("resize", connect);
        return () => {
            window.removeEventListener("resize", connect);
            observer?.disconnect();
        };
    }, []);

    const darkChrome = onLight && !menuOpen;
    const barClass = darkChrome ? "bg-[#1A1A1A]" : "bg-[#F5F3EE]";

    return (
        <>
            <header
                ref={navRef}
                className="font-canva fixed top-0 left-0 right-0 z-50 bg-transparent [&_*]:[font-family:'Canva_Sans',sans-serif]"
                style={{ fontFamily: '"Canva Sans", sans-serif' }}
            >
                <nav
                    className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center px-6 md:px-10"
                    aria-label="Primary navigation"
                >
                    <a
                        href="#home"
                        className="group shrink-0"
                        aria-label="Design Diaries — Home"
                    >
                        <Logo onLight={darkChrome} />
                    </a>

                    <ul className="hidden min-w-0 items-center pl-16 md:pl-24 lg:flex lg:pl-32">
                        {NAV_LINKS.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    className={`inline-flex items-center px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 hover:bg-[#a1573c] hover:text-white ${
                                        darkChrome ? "text-[#1A1A1A]" : "text-white"
                                    }`}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="hidden shrink-0 pl-16 lg:block lg:pl-20">
                        <a
                            href="#start-project"
                            className={`group relative inline-flex items-center px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 ${
                                darkChrome
                                    ? "bg-[#1A1A1A] text-white hover:bg-zinc-600 hover:text-white"
                                    : "bg-white text-black hover:bg-zinc-300 hover:text-black"
                            }`}
                        >
                            Start a Project
                            <ArrowRight
                                className="ml-0 h-4 w-4 max-w-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
                                strokeWidth={2.4}
                            />
                        </a>
                    </div>

                    <button
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((v) => !v)}
                        className="relative col-start-3 flex h-10 w-10 flex-col items-center justify-center gap-[6px] rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0C15A] lg:hidden"
                    >
                        <span
                            className={`block h-[2px] w-6 transition-[transform,background-color] duration-300 ${barClass} ${
                                menuOpen ? "translate-y-[8px] rotate-45" : ""
                            }`}
                        />
                        <span
                            className={`block h-[2px] w-6 transition-[opacity,background-color] duration-200 ${barClass} ${
                                menuOpen ? "opacity-0" : "opacity-100"
                            }`}
                        />
                        <span
                            className={`block h-[2px] w-6 transition-[transform,background-color] duration-300 ${barClass} ${
                                menuOpen ? "-translate-y-[8px] -rotate-45" : ""
                            }`}
                        />
                    </button>
                </nav>
            </header>

            <div
                ref={menuRef}
                className="lg:hidden fixed inset-0 z-40 hidden flex-col bg-black pt-28 px-8 font-canva"
                style={{ opacity: 0 }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation"
            >
                <ul className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => (
                        <li key={link.label} data-menu-link className="border-b border-white/10">
                            <a
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block py-5 text-2xl font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#a1573c] hover:px-3"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <a
                    href="#start-project"
                    data-menu-link
                    onClick={() => setMenuOpen(false)}
                    className="group relative mt-10 inline-flex items-center justify-center bg-white px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors duration-300 hover:bg-zinc-300"
                >
                    Start a Project
                    <ArrowRight
                        className="ml-0 h-4 w-4 max-w-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-4 group-hover:translate-x-0 group-hover:opacity-100"
                        strokeWidth={2.4}
                    />
                </a>
                <p data-menu-link className="mt-auto mb-10 text-xs uppercase tracking-[0.2em] text-[#8F8F8F]">
                    Design Diaries · Gym &amp; Wellness Interiors
                </p>
            </div>
        </>
    );
}