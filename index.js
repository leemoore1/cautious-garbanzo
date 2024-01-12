const main = async () => {
  const url = "https://api.github.com/repositories/19438/commit";

  try {
    await fetch(url).then((response) => {
      try {
        response.json().then((data) => {
          // TODO #1: Write commit author details to CSV
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

main();
