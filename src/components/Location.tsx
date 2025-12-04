import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import { CONTACT_INFO } from "../src/constants/contact";

export function Location() {
  return (
    <section
      id="location"
      className="section"
      style={{ background: "var(--gray-50)" }}
    >
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-badge">Location</div>
          <h2 className="section-title">Visit Us</h2>
          <p className="section-description">
            Conveniently located in the heart of the city
          </p>
        </motion.div>

        {/* Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-8)",
          }}
        >
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
              height: "500px",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d458.198348041349!2d75.82355258170072!3d11.172560172315125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba651e030f76fb1%3A0xa1febc6ea2f8753d!2sDream%20Avenue!5e1!3m2!1sen!2sin!4v1761727867409!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Dream Avenue Convention Center Location"
            />
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "var(--space-6)",
              }}
            >
              {/* Address */}
              <div className="card">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--lime-primary), var(--lime-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <MapPin
                    size={24}
                    style={{ color: "var(--dark-text)" }}
                  />
                </div>
                <h4 style={{ marginBottom: "var(--space-3)" }}>
                  Address
                </h4>
                <p className="text-muted">
                  {CONTACT_INFO.address.street}<br />
                  {CONTACT_INFO.address.area}, {CONTACT_INFO.address.city}<br />
                  {CONTACT_INFO.address.state} {CONTACT_INFO.address.pincode}<br />
                  <span style={{ fontSize: '0.875rem', color: 'var(--lime-primary)' }}>
                    ({CONTACT_INFO.address.location})
                  </span>
                </p>
              </div>

              {/* Phone */}
              <div className="card">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--lime-primary), var(--lime-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <Phone
                    size={24}
                    style={{ color: "var(--dark-text)" }}
                  />
                </div>
                <h4 style={{ marginBottom: "var(--space-3)" }}>
                  Phone
                </h4>
                <p className="text-muted">
                  <a 
                    href={`tel:${CONTACT_INFO.phones.main}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    Main: {CONTACT_INFO.phones.main}
                  </a>
                  <br />
                  <a 
                    href={CONTACT_INFO.links.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    WhatsApp: {CONTACT_INFO.phones.whatsapp}
                  </a>
                  <br />
                  <a 
                    href={`tel:${CONTACT_INFO.phones.booking}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    Booking: {CONTACT_INFO.phones.booking}
                  </a>
                </p>
              </div>

              {/* Email */}
              <div className="card">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--lime-primary), var(--lime-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <Mail
                    size={24}
                    style={{ color: "var(--dark-text)" }}
                  />
                </div>
                <h4 style={{ marginBottom: "var(--space-3)" }}>
                  Email
                </h4>
                <p className="text-muted">
                  <a 
                    href={`mailto:${CONTACT_INFO.emails.primary}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {CONTACT_INFO.emails.primary}
                  </a>
                  <br />
                  <a 
                    href={`mailto:${CONTACT_INFO.emails.secondary}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {CONTACT_INFO.emails.secondary}
                  </a>
                </p>
              </div>

              {/* Hours */}
              <div className="card">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--lime-primary), var(--lime-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <Clock
                    size={24}
                    style={{ color: "var(--dark-text)" }}
                  />
                </div>
                <h4 style={{ marginBottom: "var(--space-3)" }}>
                  Office Hours
                </h4>
                <p className="text-muted text-[13px] text-left font-normal font-[Inter]">
                  {CONTACT_INFO.officeHours.weekdays}
                  <br />
                  {CONTACT_INFO.officeHours.weekends}
                  <br />
                  <span style={{ fontSize: '0.875rem', color: 'var(--lime-primary)' }}>
                    Available at {CONTACT_INFO.address.location}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "var(--space-4)",
              justifyContent: "center",
              marginTop: "var(--space-8)",
              flexWrap: "wrap",
            }}
          >
            {/* Connect Us Button */}
            <motion.a
              href={`tel:${CONTACT_INFO.phones.main}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
                padding: "var(--space-4) var(--space-8)",
                background: "linear-gradient(135deg, var(--lime-primary), var(--lime-secondary))",
                color: "var(--dark-text)",
                borderRadius: "var(--radius-lg)",
                textDecoration: "none",
                boxShadow: "var(--shadow-md)",
                transition: "all 0.3s ease",
                minWidth: "200px",
                cursor: "pointer",
              }}
            >
              <Phone size={20} />
              <span style={{ fontWeight: 600 }}>Connect Us</span>
            </motion.a>

            {/* Get Directions Button */}
            <motion.a
              href="https://www.google.com/maps/dir/?api=1&destination=Dream+Avenue,Feroke+Road,Karuvanthiruthy,Kozhikode,Kerala+673631"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-2)",
                padding: "var(--space-4) var(--space-8)",
                background: "linear-gradient(135deg, var(--gold-primary), var(--gold-secondary))",
                color: "var(--dark-text)",
                borderRadius: "var(--radius-lg)",
                textDecoration: "none",
                boxShadow: "var(--shadow-md)",
                transition: "all 0.3s ease",
                minWidth: "200px",
                cursor: "pointer",
              }}
            >
              <Navigation size={20} />
              <span style={{ fontWeight: 600 }}>Get Directions</span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}