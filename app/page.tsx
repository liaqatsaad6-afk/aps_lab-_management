import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(to bottom, #f8fafc 0%, #eef4ff 45%, #f8fafc 100%)',
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 20px 32px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            padding: '12px 0 28px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                overflow: 'hidden',
              }}
            >
              <Image
                src="/logo.png"
                alt="Iqra APSACS Tarbela Cantt"
                width={58}
                height={58}
              />
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#2563eb',
                }}
              >
                Iqra APSACS Tarbela Cantt
              </p>
              <h2
                style={{
                  margin: '4px 0',
                  fontSize: 26,
                  lineHeight: 1.2,
                  color: '#0f172a',
                }}
              >
                Senior Boys Computer Lab
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: '#64748b',
                }}
              >
                Digital lab records, issue tracking, and session management
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/login"
              style={{
                textDecoration: 'none',
                padding: '12px 18px',
                borderRadius: 12,
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                boxShadow: '0 10px 24px rgba(37, 99, 235, 0.22)',
              }}
            >
              Login
            </Link>

            <Link
              href="/dashboard"
              style={{
                textDecoration: 'none',
                padding: '12px 18px',
                borderRadius: 12,
                background: '#fff',
                color: '#0f172a',
                fontWeight: 600,
                border: '1px solid #dbe4f0',
              }}
            >
              Dashboard
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 28,
            alignItems: 'center',
            flex: 1,
            padding: '12px 0 24px',
          }}
        >
          {/* Left */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                background: '#e0f2fe',
                color: '#075985',
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              Computer Lab Management Portal
            </div>

            <h1
              style={{
                margin: '0 0 18px',
                fontSize: 'clamp(42px, 7vw, 76px)',
                lineHeight: 1.02,
                letterSpacing: '-0.04em',
                color: '#0f172a',
                maxWidth: 700,
              }}
            >
              Computer Lab
              <br />
              Record System
            </h1>

            <p
              style={{
                margin: 0,
                maxWidth: 700,
                fontSize: 19,
                lineHeight: 1.75,
                color: '#475569',
              }}
            >
              Manage lab computers, track hardware and software issues, maintain
              daily lab session records, and keep a reliable history of teachers,
              classes, timings, topics, and signatures in one organized system.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                marginTop: 28,
              }}
            >
              <Link
                href="/login"
                style={{
                  textDecoration: 'none',
                  padding: '14px 22px',
                  borderRadius: 14,
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                  boxShadow: '0 14px 32px rgba(37, 99, 235, 0.24)',
                }}
              >
                Open Login
              </Link>

              <Link
                href="/dashboard"
                style={{
                  textDecoration: 'none',
                  padding: '14px 22px',
                  borderRadius: 14,
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  border: '1px solid #dbe4f0',
                }}
              >
                Go to Dashboard
              </Link>

              <Link
                href="/specifications"
                style={{
                  textDecoration: 'none',
                  padding: '14px 22px',
                  borderRadius: 14,
                  background: '#ecfdf5',
                  color: '#166534',
                  fontWeight: 700,
                  border: '1px solid #bbf7d0',
                }}
              >
                View Lab Specifications
              </Link>
            </div>

            {/* Mini stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 14,
                marginTop: 32,
                maxWidth: 760,
              }}
            >
              {[
                ['20', 'Computer Systems'],
                ['Daily', 'Lab Register'],
                ['Secure', 'Role Access'],
                ['Fast', 'Issue Tracking'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  style={{
                    background: 'rgba(255,255,255,0.75)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: '18px 16px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 14,
                      color: '#64748b',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #dbe4f0',
              borderRadius: 24,
              padding: 28,
              boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 18,
                fontSize: 28,
                color: '#0f172a',
              }}
            >
              System Features
            </h3>

            <div
              style={{
                display: 'grid',
                gap: 14,
              }}
            >
              {[
                {
                  title: 'Role-Based Access',
                  text: 'Lab assistant can manage all records while head or principal can view data only.',
                },
                {
                  title: 'PC Inventory & Issues',
                  text: 'Maintain complete records of each computer with issue logging and status updates.',
                },
                {
                  title: 'Lab Session Register',
                  text: 'Record teacher name, class, topic, time, day, and signatures for each session.',
                },
                {
                  title: 'Hardware & Software Details',
                  text: 'Store full system specifications, installed software, and supporting lab resources.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 18,
                    padding: '16px 18px',
                    background: '#ffffff',
                  }}
                >
                  <h4
                    style={{
                      margin: '0 0 6px',
                      fontSize: 18,
                      color: '#0f172a',
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: '#64748b',
                      lineHeight: 1.7,
                      fontSize: 15,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: 24,
            borderTop: '1px solid #dbe4f0',
            paddingTop: 18,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            color: '#64748b',
            fontSize: 14,
          }}
        >
          <span>© 2026 All Rights Reserved — Saad </span>
          <span>Iqra APSACS Tarbela Cantt Senior Boys Computer Lab</span>
        </footer>
      </div>
    </main>
  );
}