// JavaScript source code
export default function ContactPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Contactez nous</h1>
      <form className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Nom</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
}
