/* ============================================================
   Preset Live Activity examples.
   Each preset is { id, name, category, build(): { stack, card } }
   where stack is an ordered list of components and card is the
   shell styling (variant + lineColor).
   ============================================================ */
(function (P) {

  // ---- transit ----
  P.registerPreset({
    id: "easymet-tram",
    name: "easymet — Tram in transit",
    category: "Transit",
    build: () => ({
      card: { variant: "light", lineColor: "#3FA9B5" },
      stack: [
        { component: "brand-header", props: { brand: "easymet", icon: "tram", etaLabel: "ETA", etaValue: "00:26" } },
        { component: "kicker", props: { text: "Heading to" } },
        { component: "headline-row", props: { title: "Wythenshawe Town Centre", trail: "in 9 stops" } },
        { component: "progress-rail", props: { totalStops: 18, stopsRemaining: 9 } },
        { component: "footer-sentence", props: { pre: "Next stop is", strong: "Sale", tail: "in 2 min" } },
      ],
    })
  });

  P.registerPreset({
    id: "easymet-alight",
    name: "easymet — Alight next",
    category: "Transit",
    build: () => ({
      card: { variant: "alight", lineColor: "#fff" },
      stack: [
        { component: "brand-header", props: { brand: "easymet", icon: "tram", etaLabel: "ARR", etaValue: "00:42" } },
        { component: "kicker", props: { text: "Doors left at" } },
        { component: "headline-row", props: { title: "Cornbrook", trail: "next stop" } },
        { component: "progress-rail", props: { totalStops: 18, stopsRemaining: 1 } },
        { component: "footer-sentence", props: { pre: "Doors left at", strong: "Cornbrook", tail: "in 1 min" } },
      ],
    })
  });

  P.registerPreset({
    id: "bus-arrival",
    name: "Bus 43 — Approaching",
    category: "Transit",
    build: () => ({
      card: { variant: "light", lineColor: "#1d6ed8" },
      stack: [
        { component: "brand-header", props: { brand: "TfL", icon: "bus", etaLabel: "ETA", etaValue: "08:14" } },
        { component: "kicker", props: { text: "Route 43 to" } },
        { component: "headline-row", props: { title: "London Bridge", trail: "in 3 stops" } },
        { component: "progress-rail", props: { totalStops: 12, stopsRemaining: 3 } },
        { component: "footer-sentence", props: { pre: "Next:", strong: "King's Cross", tail: "in 90 s" } },
      ],
    })
  });

  P.registerPreset({
    id: "flight-boarding",
    name: "Flight — Boarding",
    category: "Transit",
    build: () => ({
      card: { variant: "gradient-blue", lineColor: "#9ad1ff" },
      stack: [
        { component: "brand-header", props: { brand: "BA 287", icon: "plane", etaLabel: "GATE", etaValue: "B12" } },
        { component: "kicker", props: { text: "Boarding now" } },
        { component: "headline-row", props: { title: "LHR → SFO", trail: "Seat 32A" } },
        { component: "progress-bar", props: { leftLabel: "Boarding group 3", rightLabel: "Closes 14:42", percent: 60 } },
        { component: "footer-sentence", props: { pre: "Gate closes in", strong: "12 min", tail: "" } },
      ],
    })
  });

  P.registerPreset({
    id: "flight-inflight",
    name: "Flight — En route",
    category: "Transit",
    build: () => ({
      card: { variant: "gradient-blue", lineColor: "#9ad1ff" },
      stack: [
        { component: "brand-header", props: { brand: "BA 287", icon: "plane", etaLabel: "ARR", etaValue: "23:55" } },
        { component: "kicker", props: { text: "Cruising over Iceland" } },
        { component: "headline-row", props: { title: "LHR → SFO", trail: "5h 12m left" } },
        { component: "progress-bar", props: { leftLabel: "London", rightLabel: "San Francisco", percent: 38 } },
        { component: "two-col-stats", props: { leftVal: "36 000 ft", leftCap: "altitude", rightVal: "562 mph", rightCap: "ground speed" } },
      ],
    })
  });

  // ---- ride share ----
  P.registerPreset({
    id: "uber-ride",
    name: "Uber — En route",
    category: "Rideshare",
    build: () => ({
      card: { variant: "dark", lineColor: "#34c759" },
      stack: [
        { component: "brand-header", props: { brand: "Uber", icon: "car", etaLabel: "ARR", etaValue: "21:42" } },
        { component: "kicker", props: { text: "Trip to" } },
        { component: "headline-row", props: { title: "Soho Square", trail: "8 min away" } },
        { component: "map-thumb", props: {} },
        { component: "courier-row", props: { initials: "PG", name: "Pavel · BMW 3 Series", meta: "Plate · YK19 PTV", arrivalLabel: "Drop-off", arrivalValue: "21:42" } },
      ],
    })
  });

  P.registerPreset({
    id: "lyft-ride",
    name: "Lyft — Driver arriving",
    category: "Rideshare",
    build: () => ({
      card: { variant: "light", lineColor: "#ff00bf" },
      stack: [
        { component: "brand-header", props: { brand: "Lyft", icon: "car", etaLabel: "ETA", etaValue: "2 min" } },
        { component: "kicker", props: { text: "Driver arriving" } },
        { component: "headline-row", props: { title: "Sara · Toyota Prius", trail: "Silver · 7HKL293", titleSize: "small" } },
        { component: "progress-bar", props: { leftLabel: "Sara is heading to you", rightLabel: "2 min", percent: 78 } },
        { component: "action-buttons", props: { primary: "Contact", secondary: "Share trip", danger: "Cancel" } },
      ],
    })
  });

  // ---- food delivery ----
  P.registerPreset({
    id: "doordash",
    name: "DoorDash — Out for delivery",
    category: "Food",
    build: () => ({
      card: { variant: "light", lineColor: "#eb1700" },
      stack: [
        { component: "brand-header", props: { brand: "DoorDash", icon: "bag", etaLabel: "ETA", etaValue: "12 min" } },
        { component: "kicker", props: { text: "From" } },
        { component: "headline-row", props: { title: "Chipotle · Old Street", trail: "" } },
        { component: "progress-bar", props: { leftLabel: "Picked up", rightLabel: "Heading to you", percent: 64 } },
        { component: "courier-row", props: { initials: "DA", name: "Dasher Amira", meta: "On the way · 0.8 mi", arrivalLabel: "Drops off", arrivalValue: "19:42" } },
      ],
    })
  });

  P.registerPreset({
    id: "ubereats",
    name: "Uber Eats — Preparing",
    category: "Food",
    build: () => ({
      card: { variant: "dark", lineColor: "#00d063" },
      stack: [
        { component: "brand-header", props: { brand: "Uber Eats", icon: "bag", etaLabel: "ETA", etaValue: "27 min" } },
        { component: "kicker", props: { text: "Preparing your order at" } },
        { component: "headline-row", props: { title: "Honest Burgers", trail: "" } },
        { component: "progress-bar", props: { leftLabel: "Preparing", rightLabel: "On the way", percent: 32 } },
        { component: "item-list", props: { items: "Tribute burger\t£12.50\nRosemary fries\t£4.00\nVanilla shake\t£5.00", totalLabel: "Total", totalValue: "£21.50" } },
      ],
    })
  });

  P.registerPreset({
    id: "dominos",
    name: "Domino's — In the oven",
    category: "Food",
    build: () => ({
      card: { variant: "light", lineColor: "#e31837" },
      stack: [
        { component: "brand-header", props: { brand: "Domino's", icon: "pizza", etaLabel: "ETA", etaValue: "19:55" } },
        { component: "kicker", props: { text: "Your pizza is" } },
        { component: "headline-row", props: { title: "In the oven 🔥", trail: "step 3 of 5", titleSize: "small" } },
        { component: "progress-bar", props: { leftLabel: "Order placed", rightLabel: "Out the door", percent: 56 } },
        { component: "footer-sentence", props: { pre: "Next:", strong: "Quality check", tail: "in 2 min" } },
      ],
    })
  });

  P.registerPreset({
    id: "starbucks",
    name: "Starbucks — Pickup ready",
    category: "Food",
    build: () => ({
      card: { variant: "gradient-green", lineColor: "#ffffff" },
      stack: [
        { component: "brand-header", props: { brand: "Starbucks", icon: "timer", iconColor: "#1e6c4a", etaLabel: "READY", etaValue: "Now" } },
        { component: "kicker", props: { text: "Order ready for pickup" } },
        { component: "headline-row", props: { title: "Callum's order", trail: "3 items", titleSize: "small" } },
        { component: "item-list", props: { items: "Iced flat white\t12 oz\nBlueberry muffin\t1\nWater\t1", totalLabel: "", totalValue: "" } },
        { component: "action-buttons", props: { primary: "I'm here", secondary: "Get directions", danger: "" } },
      ],
    })
  });

  // ---- packages ----
  P.registerPreset({
    id: "amazon",
    name: "Amazon — Out for delivery",
    category: "Packages",
    build: () => ({
      card: { variant: "light", lineColor: "#ff9900" },
      stack: [
        { component: "brand-header", props: { brand: "Amazon", icon: "pkg", etaLabel: "TODAY", etaValue: "5-8 PM" } },
        { component: "kicker", props: { text: "Out for delivery" } },
        { component: "headline-row", props: { title: "Anker GaN charger", trail: "+2 items", titleSize: "small" } },
        { component: "progress-bar", props: { leftLabel: "Last stop · 6 away", rightLabel: "ETA 5:42 PM", percent: 78 } },
        { component: "map-thumb", props: {} },
      ],
    })
  });

  P.registerPreset({
    id: "ups",
    name: "UPS — In transit",
    category: "Packages",
    build: () => ({
      card: { variant: "dark", lineColor: "#ffba00" },
      stack: [
        { component: "brand-header", props: { brand: "UPS", icon: "pkg", etaLabel: "ETA", etaValue: "Thu" } },
        { component: "kicker", props: { text: "In transit" } },
        { component: "headline-row", props: { title: "Package 1Z892A…", trail: "2 days left", titleSize: "small" } },
        { component: "progress-bar", props: { leftLabel: "Shanghai", rightLabel: "London", percent: 48 } },
        { component: "footer-sentence", props: { pre: "Last scan:", strong: "Cologne, DE", tail: "12 min ago" } },
      ],
    })
  });

  // ---- music / podcast ----
  P.registerPreset({
    id: "apple-music",
    name: "Apple Music — Now playing",
    category: "Media",
    build: () => ({
      card: { variant: "dark", lineColor: "#fa233b" },
      stack: [
        { component: "brand-header", props: { brand: "Apple Music", icon: "music", iconColor: "#fa233b", etaLabel: "", etaValue: "", showEta: false } },
        { component: "music-row", props: { title: "Heat Waves", sub: "Glass Animals · Dreamland" } },
        { component: "progress-bar", props: { leftLabel: "1:42", rightLabel: "3:58", percent: 42 } },
      ],
    })
  });

  P.registerPreset({
    id: "spotify",
    name: "Spotify — Now playing",
    category: "Media",
    build: () => ({
      card: { variant: "dark", lineColor: "#1db954" },
      stack: [
        { component: "brand-header", props: { brand: "Spotify", icon: "music", iconColor: "#1db954", showEta: false } },
        { component: "music-row", props: { title: "Time to Pretend", sub: "MGMT · Oracular Spectacular" } },
        { component: "progress-bar", props: { leftLabel: "1:17", rightLabel: "4:21", percent: 30 } },
      ],
    })
  });

  P.registerPreset({
    id: "podcast",
    name: "Podcast — Live",
    category: "Media",
    build: () => ({
      card: { variant: "gradient-purple", lineColor: "#fff" },
      stack: [
        { component: "brand-header", props: { brand: "Overcast", icon: "podcast", showEta: false } },
        { component: "music-row", props: { title: "How I built this — Patagonia", sub: "Ep. 412 · 1h 12m" } },
        { component: "progress-bar", props: { leftLabel: "42:01", rightLabel: "1:12:30", percent: 58 } },
      ],
    })
  });

  // ---- sports ----
  P.registerPreset({
    id: "nba-game",
    name: "NBA — Live game",
    category: "Sports",
    build: () => ({
      card: { variant: "dark", lineColor: "#fa6c1a" },
      stack: [
        { component: "brand-header", props: { brand: "NBA", icon: "ball", iconColor: "#fa6c1a", etaLabel: "", etaValue: "", showEta: false } },
        { component: "score-row", props: { homeCrest: "LAL", homeName: "Lakers", homeScore: 88, awayCrest: "BOS", awayName: "Celtics", awayScore: 92, clock: "Q3 04:21" } },
        { component: "footer-sentence", props: { pre: "Top scorer:", strong: "L. Doncic", tail: "31 pts" } },
      ],
    })
  });

  P.registerPreset({
    id: "premier-league",
    name: "Premier League — Live",
    category: "Sports",
    build: () => ({
      card: { variant: "gradient-purple", lineColor: "#ffd166" },
      stack: [
        { component: "brand-header", props: { brand: "Premier League", icon: "ball", iconColor: "#37003c", showEta: false } },
        { component: "score-row", props: { homeCrest: "MCI", homeName: "Man City", homeScore: 2, awayCrest: "LIV", awayName: "Liverpool", awayScore: 2, clock: "78'" } },
        { component: "footer-sentence", props: { pre: "Last:", strong: "Salah 73'", tail: "from a penalty" } },
      ],
    })
  });

  P.registerPreset({
    id: "tennis",
    name: "Tennis — Set 3",
    category: "Sports",
    build: () => ({
      card: { variant: "light", lineColor: "#0a8a3a" },
      stack: [
        { component: "brand-header", props: { brand: "Wimbledon", icon: "ball", iconColor: "#0a8a3a", showEta: false } },
        { component: "score-row", props: { homeCrest: "ALC", homeName: "Alcaraz", homeScore: "6 4 5", awayCrest: "DJO", awayName: "Djokovic", awayScore: "3 6 4", clock: "Set 3 · serving" } },
        { component: "status-pill", props: { text: "Break point", kind: "warning" } },
      ],
    })
  });

  // ---- timers / fitness ----
  P.registerPreset({
    id: "pomodoro",
    name: "Pomodoro — Focus",
    category: "Timers",
    build: () => ({
      card: { variant: "light", lineColor: "#ff6b6b" },
      stack: [
        { component: "brand-header", props: { brand: "Focus", icon: "timer", iconColor: "#ff6b6b", etaLabel: "ENDS", etaValue: "14:42" } },
        { component: "kicker", props: { text: "Focus block · Pomodoro 3 of 4" } },
        { component: "big-countdown", props: { value: "18:42", label: "remaining" } },
        { component: "progress-bar", props: { leftLabel: "Started 14:00", rightLabel: "75% complete", percent: 25 } },
      ],
    })
  });

  P.registerPreset({
    id: "cooking-timer",
    name: "Cooking timer",
    category: "Timers",
    build: () => ({
      card: { variant: "light", lineColor: "#d2691e" },
      stack: [
        { component: "brand-header", props: { brand: "Timer", icon: "timer", iconColor: "#d2691e", etaLabel: "ENDS", etaValue: "19:15" } },
        { component: "kicker", props: { text: "Cooking" } },
        { component: "headline-row", props: { title: "Pasta · al dente", trail: "step 2 of 3" } },
        { component: "big-countdown", props: { value: "03:42", label: "until done" } },
      ],
    })
  });

  P.registerPreset({
    id: "workout",
    name: "Workout — Strength",
    category: "Timers",
    build: () => ({
      card: { variant: "dark", lineColor: "#ff453a" },
      stack: [
        { component: "brand-header", props: { brand: "Fitness+", icon: "workout", iconColor: "#ff453a", showEta: false } },
        { component: "kicker", props: { text: "Strength · Block 2" } },
        { component: "headline-row", props: { title: "Bulgarian split squat", trail: "set 3 of 4" } },
        { component: "two-col-stats", props: { leftVal: "287", leftCap: "kcal", rightVal: "00:42:11", rightCap: "elapsed" } },
        { component: "progress-bar", props: { leftLabel: "Rest", rightLabel: "0:42", percent: 30 } },
      ],
    })
  });

  P.registerPreset({
    id: "run-tracker",
    name: "Run — In progress",
    category: "Timers",
    build: () => ({
      card: { variant: "gradient-green", lineColor: "#fff" },
      stack: [
        { component: "brand-header", props: { brand: "Strava", icon: "workout", iconColor: "#fc4c02", showEta: false } },
        { component: "kicker", props: { text: "Running · Tempo" } },
        { component: "headline-row", props: { title: "5.4 km", trail: "@ 5:12 /km" } },
        { component: "two-col-stats", props: { leftVal: "00:28:14", leftCap: "duration", rightVal: "142", rightCap: "bpm" } },
      ],
    })
  });

  // ---- stocks / data ----
  P.registerPreset({
    id: "stocks",
    name: "Stocks — Live",
    category: "Data",
    build: () => ({
      card: { variant: "dark", lineColor: "#30d158" },
      stack: [
        { component: "brand-header", props: { brand: "Stocks", icon: "chart", iconColor: "#30d158", etaLabel: "NYSE", etaValue: "LIVE" } },
        { component: "kicker", props: { text: "AAPL" } },
        { component: "headline-row", props: { title: "$184.21", trail: "+2.14 (+1.18%)" } },
        { component: "progress-bar", props: { leftLabel: "Day low 181.40", rightLabel: "High 186.10", percent: 60 } },
      ],
    })
  });

  // ---- weather / calendar / misc ----
  P.registerPreset({
    id: "weather-alert",
    name: "Weather — Storm alert",
    category: "Alerts",
    build: () => ({
      card: { variant: "gradient-blue", lineColor: "#9ad1ff" },
      stack: [
        { component: "brand-header", props: { brand: "Weather", icon: "weather", iconColor: "#3a85ff", etaLabel: "UNTIL", etaValue: "23:00" } },
        { component: "status-pill", props: { text: "Severe thunderstorm", kind: "warning" } },
        { component: "kicker", props: { text: "Watch in effect for" } },
        { component: "headline-row", props: { title: "Manchester area", trail: "until 23:00", titleSize: "small" } },
        { component: "footer-sentence", props: { pre: "Risk:", strong: "Hail & strong winds", tail: "" } },
      ],
    })
  });

  P.registerPreset({
    id: "calendar-event",
    name: "Calendar — Event soon",
    category: "Alerts",
    build: () => ({
      card: { variant: "light", lineColor: "#ff3b30" },
      stack: [
        { component: "brand-header", props: { brand: "Calendar", icon: "cal", iconColor: "#ff3b30", etaLabel: "STARTS", etaValue: "10:00" } },
        { component: "kicker", props: { text: "In 8 minutes" } },
        { component: "headline-row", props: { title: "Standup — Mobile team", trail: "" } },
        { component: "footer-sentence", props: { pre: "Where:", strong: "Zoom · personal room", tail: "" } },
      ],
    })
  });

  P.registerPreset({
    id: "charging",
    name: "EV charging",
    category: "Data",
    build: () => ({
      card: { variant: "light", lineColor: "#30d158" },
      stack: [
        { component: "brand-header", props: { brand: "Tesla", icon: "bolt", iconColor: "#e82127", etaLabel: "FULL", etaValue: "02:14" } },
        { component: "kicker", props: { text: "Charging at" } },
        { component: "headline-row", props: { title: "Supercharger · Knutsford", trail: "" } },
        { component: "progress-bar", props: { leftLabel: "42% · 156 mi", rightLabel: "100% · 372 mi", percent: 42 } },
        { component: "two-col-stats", props: { leftVal: "148 kW", leftCap: "drawing", rightVal: "£4.20", rightCap: "session" } },
      ],
    })
  });

  P.registerPreset({
    id: "game-match",
    name: "Game — In match",
    category: "Gaming",
    build: () => ({
      card: { variant: "gradient-purple", lineColor: "#ffd166" },
      stack: [
        { component: "brand-header", props: { brand: "Apex Legends", icon: "game", iconColor: "#da292e", showEta: false } },
        { component: "kicker", props: { text: "Match in progress" } },
        { component: "headline-row", props: { title: "12 / 20 squads left", trail: "ring closing" } },
        { component: "two-col-stats", props: { leftVal: "7", leftCap: "kills", rightVal: "1 832", rightCap: "damage" } },
      ],
    })
  });

  P.registerPreset({
    id: "voice-memo",
    name: "Voice memo — Recording",
    category: "Media",
    build: () => ({
      card: { variant: "light", lineColor: "#ff3b30" },
      stack: [
        { component: "brand-header", props: { brand: "Voice Memos", icon: "mic", iconColor: "#ff3b30", showEta: false } },
        { component: "status-pill", props: { text: "Recording", kind: "live" } },
        { component: "big-countdown", props: { value: "12:14", label: "elapsed" } },
        { component: "action-buttons", props: { primary: "", secondary: "Pause", danger: "Stop" } },
      ],
    })
  });

  P.registerPreset({
    id: "find-my",
    name: "Find My — Tracking",
    category: "Data",
    build: () => ({
      card: { variant: "dark", lineColor: "#0a84ff" },
      stack: [
        { component: "brand-header", props: { brand: "Find My", icon: "pin", iconColor: "#0a84ff", showEta: false } },
        { component: "kicker", props: { text: "Following" } },
        { component: "headline-row", props: { title: "Sarah's iPhone", trail: "5 min ago" } },
        { component: "map-thumb", props: {} },
        { component: "footer-sentence", props: { pre: "At:", strong: "Sainsbury's · Withington", tail: "" } },
      ],
    })
  });

  P.registerPreset({
    id: "sleep",
    name: "Sleep — Tracking",
    category: "Data",
    build: () => ({
      card: { variant: "gradient-purple", lineColor: "#bfa6ff" },
      stack: [
        { component: "brand-header", props: { brand: "Sleep", icon: "moon", iconColor: "#5e2a8f", showEta: false } },
        { component: "kicker", props: { text: "Sleeping · do not disturb" } },
        { component: "big-countdown", props: { value: "06:32", label: "until alarm" } },
        { component: "two-col-stats", props: { leftVal: "REM", leftCap: "phase", rightVal: "67 bpm", rightCap: "heart rate" } },
      ],
    })
  });

})(window.Playground);
