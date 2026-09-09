export default function Logo({ compact = false }) {
    return (
        <span className="inline-flex min-w-0 items-center">
            <img
                src="/images/logo.png"
                alt="DesignDiaries by Sagrika"
                className={`w-auto object-contain ${
                    compact ? "h-11 md:h-12" : "h-14 md:h-16"
                }`}
            />
        </span>
    );
}
