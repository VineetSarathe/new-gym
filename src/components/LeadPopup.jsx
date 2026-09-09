import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dd-lead-popup";
const ACCENT = "#a1573c";

const inputClasses =
    "box-border h-[42px] w-full rounded-[8px] border border-[#4A4540] bg-[#EBE6DE] px-3 font-canva text-[13px] text-[#1A1A1A] placeholder:font-['Arial_MT_Pro'] placeholder:text-[#9A958C] outline-none transition-colors duration-200 focus:border-[#A75D41] focus:bg-[#f3efea]";

function isValidName(value) {
    const v = value.trim();
    if (v.length < 2 || v.length > 80) return false;
    if (!/[A-Za-z\u00C0-\u024F]/.test(v)) return false;
    return /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F .'-]*$/.test(v);
}

function isValidPhone(value) {
    const digits = value.replace(/\D/g, "");
    if (/^(\d)\1{9,}$/.test(digits)) return false;
    if (digits.length === 12 && digits.startsWith("91")) {
        return /^[6-9]\d{9}$/.test(digits.slice(2));
    }
    if (digits.length === 11 && digits.startsWith("0")) {
        return /^[6-9]\d{9}$/.test(digits.slice(1));
    }
    if (digits.length === 10) {
        return /^[6-9]\d{9}$/.test(digits);
    }
    return false;
}

function isValidEmail(value) {
    const v = value.trim();
    if (!v || v.length > 254 || /\s/.test(v) || v.includes("..")) return false;
    if (v.startsWith(".") || v.startsWith("@") || v.endsWith(".")) return false;
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v);
}

export default function LeadPopup() {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle");
    const firstFieldRef = useRef(null);
    const shownRef = useRef(false);

    const close = () => {
        setOpen(false);
        try {
            sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
            /* ignore */
        }
    };

    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY)) return undefined;
        } catch {
            /* ignore */
        }

        const maybeOpen = () => {
            if (shownRef.current) return;
            const contact = document.getElementById("start-project");
            if (contact) {
                const rect = contact.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.7) return;
            }
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (max <= 0) return;
            if (window.scrollY / max < 0.45) return;
            shownRef.current = true;
            setOpen(true);
        };

        window.addEventListener("scroll", maybeOpen, { passive: true });
        maybeOpen();
        return () => window.removeEventListener("scroll", maybeOpen);
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const t = window.setTimeout(() => firstFieldRef.current?.focus(), 40);

        const onKey = (e) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.clearTimeout(t);
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = "Enter your name.";
        else if (!isValidName(form.name)) next.name = "Enter a valid name (letters only).";

        if (!form.phone.trim()) next.phone = "Enter your phone number.";
        else if (!isValidPhone(form.phone)) {
            next.phone = "Enter a valid 10-digit mobile number.";
        }

        if (!form.email.trim()) next.email = "Enter your email.";
        else if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus("submitting");
        try {
            await new Promise((resolve) => setTimeout(resolve, 600));
            setStatus("done");
            window.setTimeout(close, 1600);
        } catch {
            setStatus("idle");
            setErrors({ submit: "Something went wrong. Please try again." });
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Close popup"
                className="absolute inset-0 bg-black/55"
                onClick={close}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="lead-popup-title"
                className="font-canva relative z-10 w-full max-w-[420px] rounded-[8px] bg-[#f3efea] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-8"
            >
                <button
                    type="button"
                    onClick={close}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center text-[22px] leading-none text-[#1A1A1A]/55 transition-colors hover:text-[#1A1A1A]"
                    aria-label="Close"
                >
                    ×
                </button>

                {status === "done" ? (
                    <div className="py-6 text-center">
                        <p
                            className="font-canva text-[10px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: ACCENT }}
                        >
                            Enquiry received
                        </p>
                        <h3
                            id="lead-popup-title"
                            className="mt-3 font-canva text-xl font-bold uppercase text-[#1A1A1A]"
                        >
                            We&apos;ll be in touch.
                        </h3>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <p
                            className="font-canva text-[11px] font-bold uppercase tracking-[0.16em]"
                            style={{ color: ACCENT }}
                        >
                            Start a conversation
                        </p>
                        <h3
                            id="lead-popup-title"
                            className="mt-2 font-canva text-[22px] font-bold uppercase leading-tight text-[#1A1A1A]"
                        >
                            Tell us how to reach you
                        </h3>

                        <div className="mt-6 flex flex-col gap-4">
                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
                                    Name *
                                </span>
                                <input
                                    ref={firstFieldRef}
                                    type="text"
                                    name="name"
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={handleChange("name")}
                                    onBlur={() => {
                                        if (form.name && !isValidName(form.name)) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                name: "Enter a valid name (letters only).",
                                            }));
                                        }
                                    }}
                                    placeholder="Your full name"
                                    className={inputClasses}
                                    aria-invalid={!!errors.name}
                                />
                                {errors.name ? (
                                    <p className="mt-1.5 text-[11px]" style={{ color: ACCENT }}>
                                        {errors.name}
                                    </p>
                                ) : null}
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
                                    Phone number *
                                </span>
                                <input
                                    type="tel"
                                    name="phone"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    value={form.phone}
                                    onChange={handleChange("phone")}
                                    onBlur={() => {
                                        if (form.phone && !isValidPhone(form.phone)) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                phone: "Enter a valid 10-digit mobile number.",
                                            }));
                                        }
                                    }}
                                    placeholder="+91 9876543210"
                                    className={inputClasses}
                                    aria-invalid={!!errors.phone}
                                />
                                {errors.phone ? (
                                    <p className="mt-1.5 text-[11px]" style={{ color: ACCENT }}>
                                        {errors.phone}
                                    </p>
                                ) : null}
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A]">
                                    Email *
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    onBlur={() => {
                                        if (form.email && !isValidEmail(form.email)) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                email: "Enter a valid email address.",
                                            }));
                                        }
                                    }}
                                    placeholder="you@email.com"
                                    className={inputClasses}
                                    aria-invalid={!!errors.email}
                                />
                                {errors.email ? (
                                    <p className="mt-1.5 text-[11px]" style={{ color: ACCENT }}>
                                        {errors.email}
                                    </p>
                                ) : null}
                            </label>
                        </div>

                        {errors.submit ? (
                            <p className="mt-3 text-sm" style={{ color: ACCENT }}>
                                {errors.submit}
                            </p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={status === "submitting"}
                            className="case-study-cta relative mt-6 inline-flex h-[44px] w-full items-center justify-center overflow-hidden rounded-[8px] bg-[#a1573c] px-5 font-canva text-[11px] font-bold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span
                                aria-hidden="true"
                                className="case-study-cta-fill case-study-cta-fill-hover pointer-events-none absolute inset-0 bg-[#8b4630]"
                            />
                            <span
                                aria-hidden="true"
                                className="case-study-cta-fill case-study-cta-fill-normal pointer-events-none absolute inset-0 bg-[#a1573c]"
                            />
                            <span className="relative z-[1]">
                                {status === "submitting" ? "Sending..." : "Submit"}
                            </span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
