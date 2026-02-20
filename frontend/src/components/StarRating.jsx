
function StarRating({ rating }) {
    return (
        <div className="text-warning">
            {[1,2,3,4,5].map(num => (
                <i
                    key={num}
                    className={`bi ${
                        num <= rating
                            ? "bi-star-fill"
                            : "bi-star"
                    }`}
                ></i>
            ))}
        </div>
    );
}
export default StarRating;