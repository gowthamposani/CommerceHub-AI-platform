import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          border: "1px solid rgb(229 231 235)",
          borderRadius: "8px",
          boxShadow: "0 12px 30px rgb(15 23 42 / 0.12)",
          color: "rgb(31 41 55)"
        }
      }}
    />
  );
}
