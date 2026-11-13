# What the crows say…? — Gameplay & UI Specification

> Source of truth for the vibecoded demo preview. Translated from the Czech GDD (sections *Hratelnost* and *Uživatelské rozhraní*).

---

# Gameplay

The player, in the role of the innkeeper, progresses through the game day by day. The core of the game is **information management**. It is up to the player to pay close attention to what is happening in the story and use their own judgement to move the plot forward. In conversations and when seating guests, the player makes decisions that directly affect how the story develops.

## Game Loop

The main loop is a single in-game day, divided into four parts:

### Morning (before opening)

- New scrolls with news appear on the desk.
- The innkeeper reads the scrolls and cuts out important information from them.
- The innkeeper arranges scrolls and clippings on the desk and on the board, and throws unneeded ones into the bin.
- Guests who stayed the previous night and have something to say may be waiting in the lounge.
- Once the innkeeper is ready, they open the inn.

### Day

- Guests come to the counter one by one.
- A conversation takes place with each guest, in which the innkeeper selects responses or inserts clippings.
- After the conversation, the innkeeper seats the guest at a table.
- At any time, the innkeeper can switch to the lounge and invite a waiting guest to the counter. Anyone not invited comes on their own as the last guest of the day.
- The day ends once the innkeeper has served all guests.

### Evening

- For each guest, the innkeeper decides whether to let them stay overnight in one of the rooms (and which one), or to kick them out.

### Night

- The player receives an end-of-day evaluation summarizing what happened.
- Then the next morning begins.

## Level Design

Levels are the individual in-game days. Each day has a predefined schedule of which scrolls arrive in the morning and which guests come to the inn or wait in the lounge. The schedule adapts dynamically to the player's earlier decisions, so guests, follow-up conversations and articles in the scrolls are added or removed accordingly.

## Saving

The game saves automatically between days and after every conversation. In addition, the player can save manually at any time.

## Control Scheme

The game is controlled by mouse only. The player clicks on responses and buttons, drags scrolls, clippings and items around the desk and onto the board, and on hover sees a tooltip with additional information, e.g. where a clipping came from.

## Mechanics

The subsections below describe the individual game mechanics. **All meters (stress meter, kingdom affinity and guest affinity) are hidden from the player**, who can only infer their changes indirectly from how the game reacts.

### Scrolls

Every morning, new scrolls with news from each kingdom arrive on the innkeeper's desk. Scrolls from previous days stay on the desk until the player throws them away. The player opens a scroll and reads it in the reader. Article content reacts to the player's earlier decisions, so some news only appears if something specific happened before.

### Board

The board is an area to the left of the main view where the player pins scrolls and clippings and connects them with colored strings. It serves as their investigation board for organizing information and has no direct effect on the game by itself. The board layout persists between days.

### Cutting Information from Conversations and News

Predefined sections of text can be cut out of both scrolls and guest lines; they appear on the desk as separate slips of paper. Scrolls and clippings carry the color and icon of the kingdom they come from. Clippings from conversations have the guest's icon and their kingdom's icon; until the player knows the guest's affiliation, a question mark is shown instead of the kingdom icon. The player can throw unneeded scrolls and clippings into the bin.

### Inserting Information into Conversations

Occasionally, an empty bubble with a topic appears among the responses. The player drags a clipping into it, or clicks it and picks from a list of clippings that match the topic, which selects the corresponding innkeeper line. When different sources claim different things about the same event, this is how the player chooses whose version of the story to spread. A clipping that does not match the topic is rejected by the bubble. A clipping is not consumed when used, and a regular response is always available next to the bubble.

### Seating Policy

After each conversation, the innkeeper chooses which table and which seat to put the guest at. Who sits with whom at a table affects the affinity of the guests and their kingdoms.

### Overnight Stay

In the evening, the innkeeper decides about all guests who sat at tables that day: each one either stays overnight in one of the rooms or is kicked out. Who gets a bed, who is kicked out and who shares a room with whom changes the affinity of the guests and their kingdoms. Guests always stay for one night only. If a guest has something to say after their stay, they appear in the lounge the next morning.

### End-of-Day Evaluation

After the overnight decisions, the day ends with an evaluation. The player sees a summary of what happened during the day and night and how their decisions turned out. The game then moves on to the next morning.

### Stress Meter

The innkeeper has a hidden stress meter with a set threshold.

### Kingdom Affinity

Each kingdom has a hidden meter expressing how it views the innkeeper. It is affected by how the innkeeper answers guests, whom they seat where, whom they accommodate or kick out, and whose version of information they spread using clippings. The value carries over between days.

### Guest Affinity

Each guest has their own hidden meter of their relationship with the innkeeper. It is created on the guest's first arrival and persists for the entire game. It is changed by conversation responses, table seating and overnight decisions.

### Guests

Guests come to the inn one by one according to the day's schedule. Each belongs to one of the kingdoms or to another group. A guest's name and affiliation are initially hidden and the player only finds them out through conversation; once revealed, they remain recorded. The same guest may return on multiple days and builds on what happened between them and the innkeeper before.

### Conversations with Guests

The guest greets the innkeeper and says their line, after which the innkeeper responds by choosing from the offered options or by inserting a clipping into a bubble; conversation length varies. Which lines the guest says and which responses the innkeeper has available depends on the stress meter, affinity with the kingdom and the guest, and on earlier events.

### Detecting Lies from Character Visuals

Guests will show visual clues by which the player can recognize whether a guest is lying or telling the truth.

### Time

A day has no fixed time limit and ends when the innkeeper has served all of that day's guests. How much of the day remains is shown by visual indicators in the inn — for example a candle that shrinks by 1/x after each conversation, where x is the total number of guests that day.

### Random Items on the Desk

The innkeeper may receive various items from guests, such as a pouch of gold. Items lie on the desk and the player can move them around freely. For now they mainly serve to emphasize the consequences of the player's decisions.

### Lounge

The lounge is a room to the right of the main view that can be switched to at any time during the day. In the morning, guests who stayed the previous night wait there with a follow-up conversation prepared. An invited guest jumps ahead of whoever is currently at the counter; their entire conversation and seating takes place, and then the original conversation resumes where it left off. If the player does not call a lounge guest to the counter, that guest comes on their own as the last arrival of the day.

### Limited Space

The innkeeper's desk has limited space for scrolls, clippings and items, and the game actively works with this. The player has to consider what to keep on the desk, what to move to the board and what to throw into the bin.

### Chronicle

The chronicle has two parts. The title screen has a **Chronicle** button with a list of achievements, characters the player has met, and endings reached across all playthroughs. In addition, an in-game **character log** is available: clicking the arrow at the top of the screen slides out portraits and names of characters along with the days the player talked to them. Clicking a portrait opens the full conversation record with that character, where the player can recall the story so far and cut out information retroactively.

---

# User Interface

The game is displayed on a static screen from the perspective of the innkeeper behind the counter. The bottom part is taken up by the **desk**, which is always visible, while the upper part shows one of three views: the **board** on the left, the **main view** in the middle and the **lounge** on the right. The player moves between views using arrows at the screen edges — from the main view, the left arrow leads to the board and the right arrow to the lounge, from which an arrow leads back. Overlay windows open over the views, and in the evening the game switches to separate evening screens. **No meters are shown directly in the interface.**

## Title Screen and Menu

The title screen has the items **New Game**, **Load Game**, **Chronicle** and **Settings**. The Chronicle shows achievements, characters met and endings reached across all playthroughs. A menu with save, load and settings is also available during gameplay.

## Main View

The main view represents what the innkeeper sees from their place behind the counter. In the center is the portrait of the guest currently standing at the counter, with the conversation window next to it. In the morning and at the end of the day, the inn's door is shown instead of a guest, with a button to open or close it. At the screen edges are arrows to the board and the lounge, and at the top an arrow that slides out the character log.

## Conversation Window

The conversation runs as a scrollable log. The guest's lines are left-aligned with their name (shown as question marks until the player knows it); the innkeeper's responses are on the right. Below the last line are buttons with possible responses and, optionally, an empty topic bubble into which the player inserts a clipping. Text that can be cut out is highlighted with a frame on hover and the cursor changes to scissors. A response chosen via a clipping has a small tag beneath it with the color and icon of the clipping used.

## Innkeeper's Desk

The desk occupies the bottom strip of the screen and is visible in all views. Scrolls, clippings and items lie on it; the player can move them freely and stack them on top of each other. The desk also has a bin for throwing things away and a small map of the inn's tables showing seated guests.

## Board

The board is a cork board to the left of the main view. The player drags scrolls and clippings onto it from the desk, where they get pinned, and connects them with colored strings. Clicking a clipping shows its text in a large preview.

## Lounge

The lounge is a room to the right of the main view. Waiting guests are shown as portraits with names. Clicking a guest reveals a button beneath them to invite them to the counter.

## Overlay Windows

Overlay windows open over the main views and are closed with an X button or by clicking outside them:

- **Scroll reader** with the full newspaper text
- **Clipping picker** after clicking an empty bubble
- **Seat picker** after a conversation ends
- **Character log** with portraits and full conversations

## Evening Screens

In the evening, the game switches to two separate screens:

1. **Overnight assignment** — for each guest who sat at a table that day, the player selects a bed in one of the rooms, or kicks them out. The player can only continue once every guest has an assigned outcome.
2. **End-of-day evaluation** — a summary of events with a button to proceed to the next morning.

## Player Feedback

Since all meters are hidden, the game communicates what is happening through other means:

- The **candle** shows how much of the day remains.
- **Tooltips** reveal, for example, a clipping's source or the name of a seated guest.
- The **lounge arrow** carries a badge with the number of waiting guests.
- A bubble that **rejects a clipping** briefly turns red and the clipping returns to its place.
- The main feedback on the player's decisions is **character reactions in conversations** and the **end-of-day evaluation**.
