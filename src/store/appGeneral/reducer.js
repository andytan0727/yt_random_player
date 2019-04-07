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
    {
      version: "1.0.2",
      changes: [
        "Fix the problem of proceeding to player page with an empty playing list",
      ],
    },
    {
      version: "1.0.3",
      changes: [
        "Fix broken UI when video not found in player page",
        "Update navbar links' style on active page",
      ],
    },
    {
      version: "2.0.0",
      changes: [
        "Change main page appearance",
        "Improve playlist input page UI",
        "Add new mini player as an alternative to the existing YT player",
        "All non-valid URL path on / will be redirected to main page instead, and all non-valid path on /player will be directed to /player/ytplayer",
      ],
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
