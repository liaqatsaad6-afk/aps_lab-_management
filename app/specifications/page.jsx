import Image from 'next/image';

export default function SpecificationsPage() {

  const images = [
    { src: "/pcline1.jpg", alt: "Computer Lab Image 1" },
    { src: "/pcline2.jpg", alt: "Computer Lab Image 2" },
    { src: "/pcline3.jpg", alt: "Computer Lab Image 3" },
    { src: "/projector_switch.jpg", alt: "Projector Switch" },
    { src: "/softwares.jpg", alt: "Installed Software 1" },
    { src: "/softwaress.jpg", alt: "Installed Software 2" },
  ];

  return (
    <main style={pageWrap}>
      <section style={heroSection}>
        <div style={heroContent}>
          <p style={eyebrow}>LAB SPECIFICATIONS</p>
          <h1 style={heroTitle}>Computer Lab Hardware & Software Specifications</h1>
          <p style={heroText}>
            This page presents the general hardware and software specifications of the
            computer lab at Iqra APSACS Tarbela Cantt Senior Boys.
          </p>
        </div>
      </section>

      <section style={card}>
        <h2 style={sectionTitle}>Hardware Section</h2>
        <p style={paragraph}>
          The computer lab consists of 20 desktop systems arranged for student use,
          academic practice, and classroom activities.
          *)i5 4 gen, 4GB PC3 RAM, 500gb HDD, 19.5" monitors, and standard peripherals.
          *)The lab also includes a projector, a projector switch for multiple inputs, and a network setup for internet access and file sharing.
        </p>
      </section>

      <section style={card}>
        <h2 style={sectionTitle}>Software Section</h2>
        <p style={paragraph}>
          The software setup include OS win 10 64bit, softwares:
          *)Microsoft Office Suite (Word, Excel, PowerPoint)
          *)Typing tutor, antivirus, and other essential utilities.
          *)Programming IDEs (Visual Studio Code, Eclipse,dev c++)
          *)Educational software for learning programming languages and computer science concepts.
          *)The lab is equipped with necessary drivers and utilities to support the hardware
          and programming tools.
        </p>
      </section>

      <section style={card}>
        <h2 style={sectionTitle}>Lab Images</h2>
        <p style={paragraph}>
          The images below represent the lab environment and setup.
        </p>

        <div style={imageGrid}>
          {images.map((img, index) => (
            <div style={imageCard} key={index}>
              <Image
                src={img.src}
                alt={img.alt}
                width={900}
                height={520}
                style={galleryImage}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* STYLES */

const pageWrap = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '28px 20px',
  background: '#f8fafc',
};

const heroSection = {
  background: 'linear-gradient(135deg, #ffffff, #eef4ff)',
  borderRadius: 22,
  padding: 28,
  marginBottom: 18,
};

const heroContent = {
  maxWidth: 860,
};

const eyebrow = {
  color: '#2563eb',
  fontSize: 12,
  fontWeight: 800,
};

const heroTitle = {
  fontSize: 30,
  margin: '10px 0',
};

const heroText = {
  color: '#64748b',
};

const card = {
  background: '#fff',
  borderRadius: 18,
  padding: 20,
  marginBottom: 18,
};

const sectionTitle = {
  fontSize: 22,
  marginBottom: 10,
};

const paragraph = {
  color: '#475569',
};

const imageGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
};

const imageCard = {
  borderRadius: 16,
  overflow: 'hidden',
  aspectRatio: '1152 / 519',   // ✅ keeps all images same shape
  border: '1px solid #dbe4f0',
  background: '#fff',
};

/* ✅ FIXED IMAGE STYLE */
const galleryImage = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};