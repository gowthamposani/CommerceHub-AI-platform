import { useCallback, useState } from "react";

export function useModal(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  return {
    open,
    openModal: useCallback(() => setOpen(true), []),
    closeModal: useCallback(() => setOpen(false), []),
    toggleModal: useCallback(() => setOpen((value) => !value), [])
  };
}
