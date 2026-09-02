const mobileNav = [
  { label: "Home", icon: "⌂" },
  { label: "Chats", icon: "💬", active: true },
  { label: "Calls", icon: "📞" },
  { label: "Updates", icon: "◉" },
  { label: "Me", icon: "◍" },
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-panel">
        <div className="footer-brand-block">
          <strong>AppTechLabs</strong>
          <span>Connect. Build. Grow.</span>
        </div>

        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {mobileNav.map(({ label, icon, active }) => (
            <button
              key={label}
              type="button"
              className={`mobile-nav-item ${active ? "active" : ""}`}
            >
              <span aria-hidden="true">{icon}</span>
              <small>{label}</small>
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
