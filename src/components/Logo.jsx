export default function Logo({ compact = false, onLight = false }) {
    return (
        <span className="inline-flex min-w-0 items-center">
            <img
                src="/images/logo.png?v=3"
                alt="DesignDiaries by Sagrika"
                className={`w-auto object-contain transition-[filter] duration-300 ${
                    compact ? "h-11 md:h-12" : "h-14 md:h-16"
                } ${onLight ? "brightness-0" : ""}`}
            />
        </span>
    );
}
