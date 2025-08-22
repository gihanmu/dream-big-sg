import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dream Big SG: Superhero Edition",
  description: "Become a Superhero and Build Singapore! A kid-friendly app where children imagine their future careers as superheroes building Singapore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes before React hydration
              (function() {
                // List of known browser extension attributes that cause hydration issues
                const extensionAttributes = [
                  'cz-shortcut-listen',
                  'data-new-gr-c-s-check-loaded',
                  'data-gr-ext-installed',
                  'data-lt-installed',
                  'data-gramm',
                  'data-gramm_editor',
                  'data-enable-grammarly'
                ];
                
                // Clean existing attributes
                function cleanExtensionAttributes() {
                  extensionAttributes.forEach(attr => {
                    const elements = document.querySelectorAll('[' + attr + ']');
                    elements.forEach(el => el.removeAttribute(attr));
                  });
                }
                
                // Run cleanup immediately
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', cleanExtensionAttributes);
                } else {
                  cleanExtensionAttributes();
                }
                
                // Set up MutationObserver to prevent future injections
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'attributes') {
                        const attrName = mutation.attributeName;
                        if (attrName && extensionAttributes.includes(attrName)) {
                          mutation.target.removeAttribute(attrName);
                        }
                      }
                    });
                  });
                  
                  // Start observing once DOM is ready
                  function startObserving() {
                    observer.observe(document.body || document.documentElement, {
                      attributes: true,
                      attributeFilter: extensionAttributes,
                      subtree: true
                    });
                  }
                  
                  if (document.body) {
                    startObserving();
                  } else {
                    document.addEventListener('DOMContentLoaded', startObserving);
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
