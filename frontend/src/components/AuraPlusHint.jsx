import { Link } from "react-router-dom";
export default function AuraPlusHint({ className = "" }) {
    return (
        <p className={`aura-plus-hint${className ? ` ${className}` : ""}`}>
            Need more?{" "}
            <Link to="/aura-plus" className="aura-plus-hint__link">
                Aura+
            </Link>{" "}
            will offer higher limits.
        </p>
    );
}
