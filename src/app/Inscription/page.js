export default function RegistrationPage() {
  return (
    <div className="center-container">
      <div style={{ padding: "2rem" }}>
        <h1>Registration</h1>
        <form className="registration-form">
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" required />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="cv">Upload CV</label>
            <input type="file" id="cv" name="cv" accept=".pdf,.doc,.docx" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message to Recruiters</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
