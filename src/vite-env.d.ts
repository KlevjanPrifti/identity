/// <reference types="vite/client" />

// Make JSX namespace available globally
import "react";

declare global {
  namespace JSX {
    interface Element extends React.JSX.Element {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}
