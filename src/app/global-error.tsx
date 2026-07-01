"use client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong | upharVilla</title>
        <meta name="robots" content="noindex" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Poppins', sans-serif;
            background: #ffffff;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            color: #1a1625;
          }
          @keyframes popIn {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)   scale(1); }
          }
          .card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border: 1px solid rgba(0,0,0,0.08);
            border-radius: 16px;
            box-shadow: 0 4px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
            overflow: hidden;
            animation: popIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
          }
          .card-body { padding: 2.5rem 2rem 2rem; }
          .brand {
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #ad8de9;
            margin-bottom: 1.75rem;
          }
          .icon-wrap {
            width: 2.5rem; height: 2.5rem;
            border-radius: 10px;
            background: #fdf4ff;
            border: 1px solid #f0e6ff;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 1rem;
          }
          h1 { font-size: 1.15rem; font-weight: 600; color: #1a1625; margin-bottom: 0.5rem; line-height: 1.3; }
          p.sub { font-size: 0.85rem; font-weight: 400; color: #7c6aad; line-height: 1.6; margin-bottom: 1.75rem; }
          .actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
          a.btn-primary, button.btn-outline {
            display: inline-block;
            padding: 0.6rem 1.4rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.82rem;
            text-decoration: none;
            letter-spacing: 0.01em;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
          }
          a.btn-primary { background: #ad8de9; color: #fff; border: none; }
          button.btn-outline { background: transparent; color: #ad8de9; border: 1px solid #ad8de9; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div style={{ height: "3px", background: "#f0ebfa" }}>
            <div
              style={{ height: "100%", width: "100%", background: "#ad8de9" }}
            />
          </div>
          <div className="card-body">
            <p className="brand">upharVilla</p>
            <div className="icon-wrap">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ad8de9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1>Something went wrong</h1>
            <p className="sub">
              A critical error occurred while loading the page. Please try again
              or return home.
            </p>
            <div className="actions">
              <a href={`${SITE_URL}/`} className="btn-primary">
                Back to Home
              </a>
              <button type="button" className="btn-outline" onClick={reset}>
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
