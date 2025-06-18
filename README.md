# Getting started

Here are the documentation for the Kanban project which is built using
Next.js framework.


## Prerequisites Installations

Before you begin, ensure that the following tools and environments are installed on your machine:

- **Node.js** (version 20.13.x or higher)
- **NPM** (version 10.x or higher)
- A similar code editor, such as **Visual Studio Code**, **Sublime Text**, or **Notepad++**

**Important**: After installation, confirm successful setup by running the following commands in your terminal:

```bash (Terminal)
node -v
npm -v
```

These should display the installed versions of **Node.js** and **NPM**, respectively.

## Helpful Resources

Here are some essential resources that will aid you throughout the development process:

- [Next.js documentation](https://nextjs.org/) - Understand how Node.js works and how to harness its capabilities.
- [Npm documentation](https://docs.npmjs.com/) - Dive deeper into how NPM can manage your project's dependencies.

## Installing Dependencies

To get the project up and running, you'll first need to install all required dependencies. From the root directory, run:

```bash (Terminal)
npm install
```

If you encounter any dependency conflicts or errors, try the following command:

```bash (Terminal)
npm install --legacy-peer-deps
```

Once completed, verify the installation by checking for the presence of the **node_modules** folder in your project root. If the folder is missing, the installation didn't succeed, and you may need to troubleshoot further.

 ## Running the Development Server

To start the development server and preview your project locally, use the following command:

```bash (Terminal)
npm run dev
```

After the server starts, you should see output similar to this in your terminal:

```bash (Terminal)
> kanban@0.1.0 dev
> next dev --turbopack

 ⚠ Port 3000 is in use, using available port 3001 instead.
   ▲ Next.js 15.3.3 (Turbopack)
   - Local:        http://localhost:3001
   - Network:      http://192.168.105.81:3001

 ✓ Starting...
 ✓ Ready in 628ms
```

If you don’t see this message or if an error appears, there may be an issue with your setup that requires checking the dependencies or configurations.

## Deployment

To generate a production-ready build with optimized code, run:

```bash (Terminal)
npm run build
```

This will launch the optimized build, allowing you to review the final version of your app before deploying it to production.

```bash (Terminal)
npm start
```
