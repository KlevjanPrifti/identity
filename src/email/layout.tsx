import { Body, Container, Head, Html, Preview, Section, Text } from "jsx-email";
import type { PropsWithChildren, ReactNode, CSSProperties } from "react";

const main: CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

const outerContainer: CSSProperties = {
  backgroundColor: "#f6f9fc",
  padding: "40px 20px",
};

const contentBox: CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "48px 48px 32px",
  boxSizing: "border-box",
};

const externalFooter: CSSProperties = {
  textAlign: "center" as const,
  padding: "24px 20px 0",
  maxWidth: "600px",
  margin: "0 auto",
};

const externalFooterText: CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 8px 0",
};

const copyrightText: CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};

export const EmailLayout = ({
  locale,
  children,
  preview,
  logoUrl,
}: PropsWithChildren<{ 
  preview: ReactNode; 
  locale: string;
  logoUrl?: string;
}>) => (
  <Html lang={locale}>
    <Head>
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Section style={outerContainer}>
        {/* Main Content - Boxed */}
        <Container style={contentBox}>
          {logoUrl && (
            <div style={{ textAlign: "center", paddingBottom: "24px" }}>
              <img src={logoUrl} style={{ maxWidth: "250px", height: "auto" }} />
            </div>
          )}
          {children}
        </Container>

        {/* External Footer - Column Layout */}
        <Container style={externalFooter}>
          <Text style={externalFooterText}>
            This email was sent by an automated system. Please do not reply.
          </Text>
          <Text style={copyrightText}>
            © {new Date().getFullYear()} All rights reserved
          </Text>
        </Container>
      </Section>
    </Body>
  </Html>
);

export default EmailLayout;
