
 # Raspberry Pi System Information Web Interface
 
![image](https://github.com/user-attachments/assets/7722044a-04d8-4d72-8b0b-956c4b8d9931)


This guide will help you set up a system information web interface on your Raspberry Pi.

## Step 1: Install Node.js

Run the following commands to install Node.js (version 20.x):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## Step 2: Install PM2

PM2 is a process manager for Node.js applications. Install it globally with:

```bash
npm install pm2 -g
```

## Step 3: Clone the Repository

Clone the repository (replace `<repo-url>` with the actual repository URL):

```bash
git clone <repo-url>
cd <project-folder>
```

## Step 4: Start the Application with PM2

Inside the project folder, run the following command to start the server with PM2:

```bash
sudo pm2 start server.js --name webscraper
sudo pm2 save
sudo pm2 startup
```

This will keep the server running and restart it automatically if the system reboots.

## Step 5: Verify the Process

To check if the process is running, use:

```bash
sudo pm2 list
```

## Step 6: Access the Web Interface

Open your browser and navigate to your Raspberry Pi's IP address on port 5050:

```
http://your-ip-address:5050
```
