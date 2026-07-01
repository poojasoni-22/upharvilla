src/app/
├── layout.tsx                    ← Root layout (providers: Convex, BetterAuth, Theme)   # Global Providers
├── (ecommerce)/
│   ├── layout.tsx                ← Ecommerce layout (Navbar, Footer)  # Navbar & Footer
│   ├── page.tsx                  ← / → HOME (all products visible)  This is now your "/" route
│   ├── products/
│   │   ├── page.tsx              ← /products
│   │   └── [id]/
│   │       └── page.tsx          ← /products/[id]
│   ├── cart/
│   │   └── page.tsx              ← /cart (protected)
│   ├── wishlist/
│   │   └── page.tsx              ← /wishlist (protected)
│   └── checkout/
│       └── page.tsx              ← /checkout (protected)
│
├── (auth)/
│   └── auth/
│       └── page.tsx              ← /auth (redirect to / if already logged in)
│
└── (admin)/
    ├── layout.tsx                ← Admin layout (Sidebar, no public Navbar)
    └── admin/
        ├── page.tsx              ← /admin dashboard
        └── inventory/
            └── page.tsx          ← /admin/inventory

<!-- ---------------------------------------------------- -->
Your (ecommerce)/layout.tsx will look like:
tsxexport default function EcommerceLayout({ children }) {
  return (
    <>
      <Navbar />        {/* has Login button → triggers modal */}
      <main>{children}</main>
      <Footer />
    </>
  )
}
And (admin)/layout.tsx will be completely separate — no public Navbar, just admin sidebar. This is the cleanest separation for UparVilla.