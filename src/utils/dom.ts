import React from 'react';

export const composeEventHandlers = <E extends React.SyntheticEvent>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) => {
  return (event: E): void => {
    originalEventHandler?.(event);

    if (!checkForDefaultPrevented || !event.defaultPrevented) {
      ourEventHandler?.(event);
    }
  };
};

export const createContext = <T>(displayName: string) => {
  const Context = React.createContext<T | null>(null);
  Context.displayName = displayName;

  const useContext = (): T => {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error(
        `use${displayName} must be used within ${displayName}Provider`
      );
    }
    return context;
  };

  return [Context, useContext] as const;
};
