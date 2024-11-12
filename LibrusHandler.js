const { log, error } = require('console');
const Librus = require('librus-api');

const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

class LibrusHandler {
	constructor(librusClient) {
		this.librusClient = new Librus();
		this.menu();
	}

	askQuestion(query) {
		return new Promise((resolve) => rl.question(query, resolve));
	}

	async loginUser() {
		let login = await this.askQuestion("Enter your librus login: ");
		let password = await this.askQuestion("Enter your librus password: ");

		console.log(`Logging user with login: ${login}`);

		try {
			await this.librusClient.authorize(login, password);

			console.log('Logged in successfully\n');

			let accountInfo = await this.librusClient.info.getAccountInfo();
			accountInfo = accountInfo.student;

			console.log('User info:');
			console.log(`> Name: ${accountInfo.nameSurname}`);
			console.log(`> Class: ${accountInfo.class}`);
			console.log(`> Index in the diary: ${accountInfo.index}`);
			console.log(`> Educator: ${accountInfo.educator}\n`);
		} catch (error) {
			if (error.response) {
				console.error(`Error logging in: ${error.response.status} - ${error.response.data}`);
				process.exit(1);
			} else if (error.request) {
				console.error('No response received from Librus:', error.request);
				process.exit(1);
			} else {
				console.error('Error during login:', error.message);
				process.exit(1);
			}
		}
	}

	async getLuckyNumber() {
		let luckyNumber = await this.librusClient.info.getLuckyNumber();

		console.log(`Lucky number for today is: ${luckyNumber}`);
	}

	async getAbsences(month) {
		let absences = await this.librusClient.absence.getAbsences();
		absences = absences['0'];

		if (absences.length == 0) {
			console.log('No absences to display. Good for you!');
		} else {
			for (let day of absences) {
				if (parseInt(day.date.split('-')[1]) != month) {
					continue;
				}

				console.log(`Attendance from: ${day.date}`);
				console.log();

				for (let row of day.table.entries()) {
					if (row != null) {
						let absence_details = await this.librusClient.absence.getAbsence(row.id);

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

			await this.askQuestion('Press Enter to continue..');
			console.clear();
		}
	}

	async getAnnouncements() {
		let announcements = await this.librusClient.inbox.listAnnouncements();

		if (announcements.length == 0) {
			console.log('No announcements to display.');
		} else {
			announcements.forEach((announcement, index) => {
				console.log(`ANNOUNCEMENT no. ${index}`);

				console.log(`Title: ${announcement.title}`);
				console.log(`Content:`);
				console.log(`"${announcement.content}"`);
				console.log(`Added by: ${announcement.user} at ${announcement.date}`);
				console.log('\n-------------------------------------------------\n');
			});

			await this.askQuestion('Press Enter to continue..');
			console.clear();
		}
	}

	async getGrades() {
		let grades = await this.librusClient.info.getGrades();

		for (let subject of grades) {
			console.log(`${subject.name.toUpperCase()}:`);

			for (let [index, semester] of subject.semester.entries()) {
				console.log(`\tSemester no. ${index + 1}:`);

				process.stdout.write(`\t[`);

				if (semester.grades && Array.isArray(semester.grades) && semester.grades.length > 0) {
					for (let grade of semester.grades) {
						process.stdout.write(`${grade.value}, `);
					}
				} else {
					process.stdout.write('No grades available.');
				}

				process.stdout.write(`]\n`);
			}

			console.log('\n ====================================================== \n');
		}
	}

	async getInbox() {
		let inboxMessages = await this.librusClient.inbox.listInbox(5);

		inboxMessages.forEach((message) => {
			let senderData = message.user.toUpperCase().split(' ', 2);

			console.log(`Sender: ${senderData[0] + ' ' + senderData[1]}`);
			console.log(`Title: ${message.title}`);
			console.log(`Date: ${message.date}`);
			console.log(`Read: ${message.read}`);

			console.log('\n===========================================\n');
		});
	}

	async menu() {
		try {
			await this.loginUser();

			console.log('Available options: \n1. List Announcements \n2. Get Lucky Number \n3. List Absences \n4. Get Grades \n5. List Inbox');
			const option = await this.askQuestion('Choose option: ');
			console.log();

			switch (option) {
				case '1':
					try {
						await this.getAnnouncements();
					} catch (error) {
						console.error('Error fetching announcements:', error);
					}
					break;
				case '2':
					try {
						await this.getLuckyNumber();
					} catch (error) {
						console.error('Error fetching lucky number:', error);
					}
					break;
				case '3':
					try {
						let month = await this.askQuestion('Select the month whose absence you want to get (1-12): ');
						if (!Number.isInteger(Number(month)) || month < 1 || month > 12) {
							throw new Error('Provided input is not valid month of the year.');
						}
						await this.getAbsences(month);
					} catch (error) {
						console.error('Error fetching absences:', error);
					}
					break;
				case '4':
					try {
						await this.getGrades();
					} catch (error) {
						console.error('Error fetching grades:', error);
					}
					break;
				case '5':
					try {
						await this.getInbox();
					} catch (error) {
						console.error('Error fetching calendar:', error);
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
}

module.exports = LibrusHandler;
