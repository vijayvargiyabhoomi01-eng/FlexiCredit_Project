FlexiCredit - Personal Finance Dashboard
FlexiCredit is a mini project based on personal finance management. I made this project using HTML, CSS, and JavaScript as part of my Full Stack Development learning. It helps users keep track of their income, expenses, balance, and savings in one place.

Run the Project
Extract the ZIP file.

Open the FlexiCredit folder in VS Code.

If you only want to run the frontend, open index.html in Chrome or any other browser.

You can start adding, editing, searching, filtering, and deleting transactions.

For the frontend-only version, no server installation is needed.

Features
Shows total balance, income, expenses, and savings rate on the dashboard.

Displays a cash-flow chart with options for all-time, last 30 days, and last 7 days.

Shows spending details based on different categories.

Allows users to add, view, edit, and delete transactions.

Provides search and filter options for transactions.

Allows transaction details to be downloaded as a CSV file.

Includes a savings goal tracker.

Has an email report option to prepare a finance summary.

Works on both desktop and mobile screens.

Includes forms with input validation and a confirmation message before deleting transactions.

Saves transaction data in the browser using localStorage.

Handles user-entered data carefully before displaying it on the page.

About the Project
The frontend version works without a backend. It stores data in the browser using localStorage, so the data is not automatically shared across different devices.

I have also used an SQL schema for reference. It contains a personal_finance database and a transactions table with details such as transaction type, title, category, amount, date, and notes.

The frontend-only version does not directly connect to MySQL or run SQL queries. Features such as database storage, login, and automatic email sending need a backend to work.

Syllabus Topics Covered
Unit 1 - HTML: Used HTML elements, forms, labels, and input validation.

Unit 2 - CSS: Used the box model, Flexbox, Grid, and media queries to design the website.

Unit 3 - JavaScript: Used JavaScript for calculations, handling user actions, searching, filtering, and updating the dashboard.

Unit 4 - Database: Used database concepts and CRUD operations for managing transactions. Actual database connectivity is handled separately through the backend.

Unit 5 - Version Control and Deployment: The project can be maintained using Git and GitHub. Tools like Jenkins, Tomcat, and Render need additional setup.

SQL Schema Details
The SQL schema contains the following fields in the transactions table:

id - Unique transaction ID and primary key.

type - Specifies whether it is INCOME or EXPENSE.

title - Name of the transaction.

category - Category of the transaction.

amount - Amount of the transaction, stored as a positive value.

transaction_date - Date of the transaction.

notes - Extra information about the transaction.

Email Reports Using Nodemailer
I have also added a backend feature for sending monthly finance reports using Nodemailer with Node.js and Express.

Setup
Install Node.js version 18 or newer.

Open the terminal in the FlexiCredit folder.

Run the following command:

npm install
Copy .env.example and create a .env file.

Add the SMTP settings of your email provider to the .env file. For Gmail, use an App Password if required.

Start the project:

npm start
Open http://localhost:3000 in your browser.

Go to the Insights page, enter the recipient's email address, and click Send email report.

Do not open index.html directly when using the backend email feature.

Important Note
Nodemailer is used to send emails. It does not read incoming emails from a mailbox. Reading emails would require an additional email integration.

The email settings should remain in the server-side .env file and should not be added to frontend JavaScript or uploaded to GitHub.

MongoDB Atlas Setup
MongoDB Atlas can be used to store transaction details through the Node.js and Express backend.

Create a database user in MongoDB Atlas.

Add your current IP address under Network Access.

Copy the connection string from Atlas.

Add the connection string to MONGODB_URI in the .env file.

Set MONGODB_DB=flexicredit.

Run npm install and then npm start.

Open the application at http://localhost:3000.

Check the transactions collection in MongoDB Atlas to verify the stored data.

Make sure the MongoDB username, password, and connection string are correct. If the connection fails, check the database user credentials and Network Access settings.

Future Improvements
Some features that can be added in the future are user login, better security, more detailed reports, automated testing, and deployment.