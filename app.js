const { log, error } = require('console');
const Librus = require('librus-api');

const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function askQuestion(query) {
	return new Promise((resolve) => rl.question(query, resolve));
}

async function loginUser(librusClient) {
	let login = '9065521u'; //await askQuestion("Enter your librus login: ");
	let password = 'Kuba2007'; //await askQuestion("Enter your librus password: ");

	console.log('Logging user with login: ', login);

	try {
		await librusClient.authorize(login, password);

		console.log('Logged in successfully');
	} catch (error) {
		if (error.response) {
			console.error(`Error logging in: ${error.response.status} - ${error.response.data}`);
		} else if (error.request) {
			console.error('No response received from Librus:', error.request);
		} else {
			console.error('Error during login:', error.message);
		}
	}
}

async function getAbsences(librusClient) {
	let absences = await librusClient.absence.getAbsences();
	absences = absences['0'];

	if (absences.length == 0) {
		console.log('No absences to display. Good for you!');
	} else {
		for (let day of absences) {
			console.log(`Attendance from: ${day.date}`);
			console.log();

			for (let [index, row] of day.table.entries()) {
				if (row != null) {
					let absence_details = await librusClient.absence.getAbsence(row.id);

					console.log('Attendance type: ', absence_details.type);
					console.log('Lesson Hour: ', absence_details.lessonHour);
					console.log('Subject: ', absence_details.subject);
					console.log('Teacher: ', absence_details.teacher);
					console.log('Was this a trip: ', absence_details.trip == false ? 'NO' : 'YES');

					console.log();
				}
			}

			console.log('-------------------------------------------------\n');
		}

		await askQuestion('Press Enter to continue..');
		console.clear();
	}
}

async function menu() {}

async function main() {
	let client = new Librus();

	try {
		await loginUser(client);

		console.log('Available options: \n1. List Announcements \n2. List Homework \n3. List Absences \n4. Get Timetable');
		const option = await askQuestion('Choose option: ');

		switch (option) {
			case '1':
				try {
					const announcements = await client.inbox.listAnnouncements();
				} catch (error) {
					console.error('Error fetching announcements:', error);
				}
				break;
			case '2':
				// Placeholder for Homework option
				break;
			case '3':
				try {
                    await getAbsences(client);
				} catch (error) {
					console.error('Error fetching absences:', error);
				}
				break;
			case '4':
				try {
					const timetable = await client.calendar.getCalendar();
					console.log(timetable);
				} catch (error) {
					console.error('Error fetching timetable:', error);
				}
				break;
			default:
				console.log('Invalid option selected.');
		}
	} catch (error) {
		if (error.response) {
			console.error(`Error logging in: ${error.response.status} - ${error.response.data}`);
		} else if (error.request) {
			console.error('No response received from Librus:', error.request);
		} else {
			console.error('Error during login:', error.message);
		}
	} finally {
		rl.close();
	}
}

main();
