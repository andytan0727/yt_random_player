const initialStates = {
  appUpdates: [
    {
      version: "1.0.0",
      changes: [
        "Trigger dark theme with global shortcut Ctrl + Alt + D",
        "Added shuffle function in Player page",
        "Trigger shuffle in Player with shortcut Ctrl + Alt + S",
        "Fix transition issue from dark theme to light theme",
      ],
    },
    {
      version: "1.0.1",
      changes: ["Fix shortcut bugs after pressed iframe and buttons"],
    },
  ],
};

export const appGeneral = (state = initialStates, action) => {
  switch (action) {
    default: {
      return state;
    }
  }
};
