const { log, error } = require("console");
const Librus = require("librus-api");

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


let client = new Librus();

function askQuestion(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
    let login = await askQuestion("Enter your librus login: ");
    let password = await askQuestion("Enter your librus password: ");

    console.log(`Logging user with login: ${login}`);

    try {
        await client.authorize(login, password); 
        console.log("Logged in successfully");
        
        console.log("Available options: \n1. List Announcements \n2. List Homework \n3. List Absences \n4. Get Timetable");
        const option = await askQuestion("Choose option: ");

        switch (option) {
            case '1':
                try {
                    const announcements = await client.inbox.listAnnouncements();
                    console.log(announcements);
                } catch (error) {
                    console.error("Error fetching announcements:", error);
                }
                break;
            case '2':
                // Placeholder for Homework option
                break;
            case '3':
                try {
                    const absences = await client.absence.getAbsences();
                    console.log(absences);
                } catch (error) {
                    console.error("Error fetching absences:", error);
                }
                break;
            case '4':
                try {
                    const timetable = await client.calendar.getTimetable();
                    console.log(timetable);
                } catch (error) {
                    console.error("Error fetching timetable:", error);
                }
                break;
            default:
                console.log("Invalid option selected.");
        }

    } catch (error) {
        if (error.response) {
            console.error(`Error logging in: ${error.response.status} - ${error.response.data}`);
        } else if (error.request) {
            console.error("No response received from Librus:", error.request);
        } else {
            console.error("Error during login:", error.message);
        }
    } finally {
        rl.close();
    }
}


main();
