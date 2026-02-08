import React from 'react';
import { useDialogContext } from './Dialog';

interface DialogCloseProps {
  /** The element to wrap with close behavior */
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
}

/**
 * DialogClose wraps a child element and adds onClick to close the dialog.
 *
 * @example
 * ```tsx
 * <DialogClose>
 *   <Button>Cancel</Button>
 * </DialogClose>
 * ```
 */
export const DialogClose: React.FC<DialogCloseProps> = ({ children }) => {
  const { onClose } = useDialogContext();

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      onClose();
    },
  });
};

DialogClose.displayName = 'DialogClose';
