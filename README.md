# BizConnect

BizConnect is a dynamic web application designed to foster innovation and collaboration by connecting individuals around business challenges and ideas. It provides a platform for users to post problems they're facing, propose solutions, and engage in discussions through a real-time feed and chat system.

## Features

-   **User Authentication**: Secure sign-up and login functionality, including social login with Google.
-   **User Profiles**: View and edit user profiles with names, bios, and avatars.
-   **Interactive Feed**: A central feed to view posts, with support for comments, likes, and polls.
-   **Content Creation**: Users can post general updates, specific "Challenges" (problems), and "Ideas".
-   **Real-time Chat**: Engage in discussions related to specific challenges or ideas.
-   **Real-time Notifications**: Get notified about interactions like new comments, likes, and chat messages.
-   **Search**: Filter through posts, challenges, and ideas to find relevant content.
-   **Static Pages**: Includes About, Contact, Terms of Service, and Privacy Policy pages.

## Tech Stack

-   **Frontend**:
    -   [React](https://reactjs.org/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Vite](https://vitejs.dev/)
    -   [Tailwind CSS](https://tailwindcss.com/)
-   **Backend**:
    -   [Supabase](https://supabase.io/) (Database, Authentication, Real-time Subscriptions)

## Hardware & Software Requirements

### Hardware

-   A computer with at least 4GB of RAM.
-   An active internet connection.

### Software

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) (v9.x or later) or another package manager like [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/).
-   A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
-   A code editor, such as [Visual Studio Code](https://code.visualstudio.com/).

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the software listed above installed on your system. You will also need a Supabase project and a Google Cloud project for authentication.

### Installation & Setup

1.  **Clone the repository**

    Replace `your-github-username/bizconnect.git` with your actual repository URL.
    ```sh
    git clone https://github.com/your-github-username/bizconnect.git
    cd bizconnect
    ```

2.  **Install dependencies**

    ```sh
    npm install
    ```

3.  **Set up environment variables**

    Create a `.env` file in the root of your project by copying the example file:
    ```sh
    cp .env.example .env
    ```

    Now, open the `.env` file and add your Supabase and Google credentials. You can find these in your Supabase project settings and Google Cloud Console.

    ```env
    # .env

    # Supabase
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

    # Google Auth
    VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    ```

4.  **Run the development server**

    ```sh
    npm run dev
    ```

    The application should now be running on `http://localhost:5173` (or another port if 5173 is in use).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.
