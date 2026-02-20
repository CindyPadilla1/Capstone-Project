import {Link} from "react-router-dom";

function Questionaire() {

    return (
        <div className="container py-4">

            <h2>Compatibility Survey</h2>

            <div className="mb-4">
                <label>How social are you?</label>
                <input type="range" min="1" max="10" className="form-range" />
            </div>

            <div className="mb-4">
                <label>Primary Love Language</label>
                <select className="form-select">
                    <option>Words of Affirmation</option>
                    <option>Acts of Service</option>
                    <option>Receiving Gifts</option>
                    <option>Quality Time</option>
                    <option>Physical Touch</option>
                </select>
            </div>

            <div className="mb-4">
                <label>Religion</label>
                <select className="form-select">
                    <option>Atheist</option>
                    <option>Buddhist</option>
                    <option>Catholic</option>
                    <option>Christian</option>
                    <option>Jewish</option>
                    <option>Hindu</option>
                    <option>Muslim</option>
                    <option>Mormon</option>
                </select>
            </div>

            <div className="mb-4">
                <label>Do you want children?</label>
                <select className="form-select">
                    <option>Yes</option>
                    <option>No</option>
                    <option>Maybe</option>
                </select>
            </div>

            <div className="mb-4">
                <label>Gender preference?</label>
                <select className="form-select">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                </select>
            </div>

            <Link to="/matching">
                <button className="submit-btn">
                    Find My Matches
                </button>
            </Link>

        </div>
    );
}

export default Questionaire;