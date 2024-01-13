var fs = require("fs");
var Papa = require("papaparse");

const url = "https://api.github.com/repositories/19438/commits";
const file1 = "part1.csv";
const file2 = "part2.csv";
const file3 = "part3.csv";

const main = async () => {
  // Remove existing files.
  removeFiles();

  try {
    // TODO: Auth with token to prevent rate limiting?
    await fetch(url).then((response) => {
      // Return if we're being rate limited by the GitHub API.
      if (response.status !== 200) {
        console.error(
          `Fetch returned status: ${response.status}, rate limit hit?`
        );
        return;
      }

      try {
        response.json().then((data) => {
          // Task #1: Write commit author details to CSV
          generateAuthorsCsvFile(data);

          // TODO #2: Get unique commit authors and write first 5 followers to CSV
          // TODO #3: For each commit, write repo URL, URL of last comment, URL of second to last comment
        });
      } catch (error) {
        console.error("Failed to parse commits as JSON");
      }
    });
  } catch (error) {
    console.error("Failed to fetch commits");
  }
};

const removeFiles = () => {
  console.log("Clean up files...");
  [file1, file2, file3].forEach((file) => {
    try {
      fs.rmSync(file, { force: true });
    } catch (error) {
      console.error(error);
    }
  });
};

const writeToFile = (filePath, data) => {
  fs.appendFile(filePath, data, (err) => {
    if (err) throw err;
  });
};

const generateAuthorsCsvFile = (data) => {
  const authors = data.map((d) => {
    return d.author;
  });

  let csv;

  try {
    // Parse the JavaScript objects into CSV
    csv = Papa.unparse(authors);
  } catch (error) {
    console.error("Failed to parse authors");
  }

  writeToFile(file1, csv);
};

main();
