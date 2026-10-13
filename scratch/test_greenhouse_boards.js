const axios = require('axios');

async function testGreenhouseBoards() {
  const boards = ['phonepe', 'swiggy', 'cred', 'postman', 'razorpay', 'browserstack'];
  for (const b of boards) {
    try {
      const res = await axios.get(`https://boards-api.greenhouse.io/v1/boards/${b}/jobs`, { timeout: 4000 });
      console.log(`Greenhouse ${b}:`, res.data?.jobs?.length, 'jobs');
    } catch (e) {
      console.log(`Greenhouse ${b} error:`, e.response?.status || e.message);
    }
  }
}

testGreenhouseBoards();
