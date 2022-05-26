const https = require('https');
const fs = require('fs');

const readCatalog = () => {
  let catalog = fs.readFileSync('./services/catalog.json');
  catalog = JSON.parse(catalog);
  const serverName = catalog.backends.fa.servers[0].url.substring(8)
  // console.log(serverName);
  return serverName;
};

const getTrainingIds = (username, machine) => {
  const result = new Promise((resolve, reject) => {
    const options = {
      hostname: machine,
      port: 443,
      path: `/crmRestApi/resources/11.13.18.05/fodTrainings?onlyData=true&q=Username='${username}'`,
      method: 'GET',
      headers: {
        'Authorization': 'Basic aGVscGFkbWluOldlbGNvbWUx',
      },
    };
    const ids = [];
    const req = https.request(options, res => {
      // console.log(`statusCode: ${res.statusCode}`);
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', d => {
        // process.stdout.write(d)
        const fullData = JSON.parse(data);
        for (const item of fullData.items) {
          ids.push(item.TrainingId);
        }
        resolve(ids);
      });
    });
    req.end();
  });
  return result;
};

const getTrainingTasksInfo = (username, machine, trainingId) => {
  const result = new Promise((resolve, reject) => {
    const options = {
      hostname: machine,
      port: 443,
      path: `/crmRestApi/resources/11.13.18.05/fodTrainings/${trainingId}/child/fodTrainingTasks?onlyData=true&q=Username='${username}'&expand=fodUserTrainingTasks`,
      method: 'GET',
      headers: {
        'Authorization': 'Basic aGVscGFkbWluOldlbGNvbWUx',
      },
    };
    const info = [];
    const req = https.request(options, res => {
      // console.log(`statusCode: ${res.statusCode}`);
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', d => {
        // process.stdout.write(d)
        const fullData = JSON.parse(data);
        for (const item of fullData.items) {
          const fodUserTrainingTasks = item.fodUserTrainingTasks;
          const fodUserTrainingTask = fodUserTrainingTasks.find(elt => elt.Username === item.Username);
          info.push({
            trainingId: item.TrainingId,
            userTrainingId: fodUserTrainingTask.UserTrainingId,
            userTrainingTaskId: fodUserTrainingTask.UserTrainingTaskId,
          });
        }
        resolve(info);
      });
    });
    req.end();
  });
  return result;
};

const getAllTrainingTasksInfo = async (username, machine, trainingIds) => {
  let result = [];
  for (const trainingId of trainingIds) {
    const partial = await(getTrainingTasksInfo(username, machine, trainingId));
    result = result.concat(partial);
  }
  return result;
};

const setTrainingTaskToPending = async (machine, info) => {
  const result = new Promise((resolve, reject) => {
    const payload = JSON.stringify({ UserTrainingTaskStatus: "Pending" });
    const options = {
      hostname: machine,
      port: 443,
      path: `/crmRestApi/resources/11.13.18.05/fodTrainings/${info.trainingId}/child/fodUserTraining/${info.userTrainingId}/child/fodUserTrainingTasks/${info.userTrainingTaskId}`,
      method: 'PATCH',
      headers: {
        'Authorization': 'Basic aGVscGFkbWluOldlbGNvbWUx',
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
      },
    };
    const req = https.request(options, res => {
      // console.log(`statusCode: ${res.statusCode}`);
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        // process.stdout.write(data);
        console.log(`Set task to 'Pending': ${JSON.stringify(info)}`);
        resolve();
      });
      res.on('error', error => {
        console.error(error);
        resolve();
      });
    });
    req.write(payload);
    req.end();
  });
  return result;
};

const setAllTrainingTasksToPending = async (machine, info) => {
  for (const elt of info) {
    await setTrainingTaskToPending(machine, elt);
  }
};

const setUserTrainingToPending = async (machine, info) => {
  const result = new Promise((resolve, reject) => {
    const payload = JSON.stringify({ UserTrainingStatus: "Pending" });
    const options = {
      hostname: machine,
      port: 443,
      path: `/crmRestApi/resources/11.13.18.05/fodTrainings/${info.trainingId}/child/fodUserTraining/${info.userTrainingId}`,
      method: 'PATCH',
      headers: {
        'Authorization': 'Basic aGVscGFkbWluOldlbGNvbWUx',
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
      },
    };
    const req = https.request(options, res => {
      // console.log(`statusCode: ${res.statusCode}`);
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        // process.stdout.write(data);
        console.log(`Set training to 'Pending': ${JSON.stringify(info)}`);
        resolve();
      });
      res.on('error', error => {
        console.error(error);
        resolve();
      });
    });
    req.write(payload);
    req.end();
  });
  return result;
}

const setAllUserTrainingStatusToPending = async (machine, info) => {
  let trainingIds = new Map();
  info.forEach(elt => {
    trainingIds.set(elt.trainingId, elt.userTrainingId);
  });
  trainingIds = Array.from(trainingIds.entries());
  for (const info of trainingIds) {
    await setUserTrainingToPending(machine, { trainingId: info[0], userTrainingId: info[1] });
  }
};

const updateForUser = async (username, machine) => {
  console.log('Resetting Training Task Status and Training Status');
  if (!machine) {
    machine = readCatalog();
  }
  console.log(`For user: ${username} on machine: ${machine}`);
  const ids = await getTrainingIds(username, machine);
  // console.log(ids);
  const allInfo = await getAllTrainingTasksInfo(username, machine, ids);
  // console.log(allInfo);
  await setAllTrainingTasksToPending(machine, allInfo);
  await setAllUserTrainingStatusToPending(machine, allInfo);
  console.log('Complete');
};

const main = async () => {
  console.log('Usage: npm run reset:trainings -- username=someuser machine=some.machine.oracle.com');
  console.log('\tusername default: helpadmin\n');
  console.log('\tmachine default from catalog file\n');
  let username = 'helpadmin';
  let machine = '';
  if (process.argv.length >= 3) {
    for (const arg of process.argv) {
      if (arg.startsWith('username=')) {
        username = arg.substr('username='.length);
      }
      if (arg.startsWith('machine=')) {
        machine = arg.substr('machine='.length);
      }
    }
  }
  await updateForUser(username, machine);
};

main();
const resetData = async() => {
 await main();
};
module.exports = {
resetData
};
