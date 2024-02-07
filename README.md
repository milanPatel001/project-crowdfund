# FUNDX - CROWDFUND RAISER SYSTEM
//link
## Project Overview

This project is a robust crowdfunding platform that allows users to contribute to individual fundraisers based on their preferences. Whether it's organizations or individuals, this platform serves as a means to garner community support for the causes they believe in.

## Project Architecture

The project follows a server-client model with one central server and multiple clients. The server plays a vital role in communication facilitation and data management, while clients connect to the server to interact with the fundraising platform. Real-time activities such as donations, updates on donation figures, maintenance of donation leaderboards, comments from donors, and notifications to fundraisers are managed through socket connections using Socket.io.

# Built Using
![Next JS](https://img.shields.io/badge/Next.js-%2320232a.svg?style=for-the-badge&logo=Next.js&logoColor=white) ![React](https://img.shields.io/badge/React-gray?style=for-the-badge&logo=react&logoColor=#FFCA28)  ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/tailwind%20CSS-e5e5e5.svg?style=for-the-badge&logo=tailwindcss&logoColor=231572B6) ![Stripe](https://img.shields.io/badge/stripe-black.svg?style=for-the-badge&logo=stripe&logoColor=23430098) ![Neon DB](https://img.shields.io/badge/neon%20db-orange.svg?style=for-the-badge)![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-3d85c6.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)

# Project Features

#### Fundraiser Listings

- Comprehensive display of active fundraising campaigns.
- Key details include the organizer and beneficiary, compelling narratives, and other pertinent information.

#### Donation System

- Facilitates real-time donations through socket connections.
- Provides instant updates on the user interface, including changes to donation amount, count, and leaderboard.

#### Donation Notifications

- Utilizes socket communication to relay donation details to the server.
- Broadcasts donation information to all connected clients, fostering widespread awareness.

#### Share Option

- Enables users to share fundraisers on various social media platforms, increasing visibility.

#### Words of Encouragement Section

- Allows donors to share uplifting messages and supportive comments on fundraisers.
- Facilitates direct communication and understanding between donors and organizers.

### Donation History

- Establishes a comprehensive record of a user's past donations.
- Presents past donation details, including associated fundraiser information.

#### Progress Bar

- Visual representation of the progress for each fundraiser.
- Progress bar dynamically updates as donations are made, reaching 100% upon reaching the fundraising goal.

#### Real-time Updates

- Instantaneous updates on the main page and fund page.
- Real-time information on recent donations, top donation leaderboards, and donation progress.

#### Security/Login

- Authentication required before establishing a socket connection to the server.
- Ensures user identity verification for accessing all platform features.

# Screenshots
![Home Page](https://github.com/milanPatel001/project-crowdfund/blob/main/backend/Images/main_page.PNG)
![Page One](https://github.com/milanPatel001/project-crowdfund/blob/main/backend/Images/fundPageone.PNG)
![Donation Page](https://github.com/milanPatel001/project-crowdfund/blob/main/backend/Images/donate1.PNG)
![Share Section](https://github.com/milanPatel001/project-crowdfund/blob/main/backend/Images/share.PNG)
![Top Section](https://github.com/milanPatel001/project-crowdfund/blob/main/backend/Images/top.PNG)




Feel free to contribute by opening issues, submitting pull requests, or providing feedback!

**Happy Fundraising!**


