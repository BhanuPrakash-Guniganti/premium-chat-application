# Real-Time Chat Application

## Project Title

Chat Application

## Technologies

- HTML
- CSS
- JavaScript
- Node.js
- Express
- Socket.IO (WebSocket-based real-time communication)

---

## Project Description

This project is a real-time web-based chat platform where users can:

- Choose a unique username.
- Join public chat rooms.
- Exchange messages in real time without refreshing the page.
- Create new rooms and switch between rooms.

The application is built with HTML, CSS, and JavaScript on the client side, and Node.js with Express and Socket.IO on the server side, as required by the assignment.

---

## Features

### User Interface

- Modern dark UI with a two-panel layout:
  - Left panel shows the list of available chat rooms and a form to create a new room.
  - Right panel contains the message display area and the message input with a send button.
- Responsive design using flexbox, works on different screen sizes (desktop and mobile).

### Real-Time Communication

- Real-time, bi-directional communication using Socket.IO over WebSockets.
- Messages are instantly broadcast to all users in the same room without page reload.
- Auto-scroll to the latest message when new messages arrive.

### User Authentication (Simple Username Login)

- Before entering the chat, the user must choose a username.
- The server checks that:
  - The username is not empty.
  - The username is not already taken by another active user.
- If the username is valid, the login overlay disappears and the user can join rooms.

> Note: For this assignment, username-based authentication is used instead of full password-based accounts.

### Chat Features

- Users can send text messages in a selected chat room.
- Each message displays:
  - Sender username.
  - Timestamp (HH:MM format based on local time).
- Basic text formatting:
  - `**bold**` → bold text.
  - `*italic*` → italic text.
  - URLs (starting with `http://` or `https://`) become clickable links that open in a new tab.
- System messages:
  - When a user joins a room.
  - When a user leaves a room or disconnects.

### Room Management

- Default room: `"General"` is created automatically on server start.
- Users can:
  - View the list of existing rooms.
  - Create new public rooms by entering a room name.
  - Click on any room in the list to join it.
- When a new room is created:
  - The server adds it to the in-memory room list.
  - All connected clients receive an updated room list.

### User Experience & Edge Cases

- Prevent sending empty or whitespace-only messages.
- Prevent creating rooms with empty names.
- Show clear error messages for:
  - Duplicate usernames.
  - Room name conflicts.
  - Trying to send a message without being logged in or without joining a room.
- Messages area scrolls automatically to the latest message for a smooth chat experience.

---

## Project Structure

chat-application
 └ backend
     ├ server.js
     ├ package.json
     └ public
         ├ index.html
         ├ style.css
         ├ script.js
         ├ manifest.json
         └ icons
             └ logo.png



**Images**
![login page](<Screenshot 2026-01-31 002100.png>)

![in app](<Screenshot 2026-01-31 002037.png>)