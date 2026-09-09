import logoMark from "../assets/logo.svg";

export default function Logo({ compact = false, onLight = false }) {
    return (
        <span className="inline-flex items-center gap-2.5 min-w-0">
            <img
                src={logoMark}
                alt=""
                className={`h-8 w-8 shrink-0 transition-[filter] duration-300 md:h-9 md:w-9 ${
                    onLight ? "brightness-0" : ""
                }`}
            />
            <span
                className={`font-canva leading-none tracking-[0.08em] whitespace-nowrap transition-colors duration-300 ${
                    onLight ? "text-[#1A1A1A]" : "text-[#F5F3EE]"
                } ${
                    compact
                        ? "text-lg md:text-xl"
                        : "text-[15px] sm:text-lg md:text-[22px]"
                }`}
                style={{ fontFamily: '"Canva Sans", sans-serif' }}
            >
                DESIGN DIARIES
            </span>
        </span>
    );
}