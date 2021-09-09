let db;
let budgetVersion;

// Create a new db request for a "budget" database.
const request = indexedDB.open('BudgetDB', budgetVersion || 21);

request.onupgradeneeded = function (e) {
//  getting the upgrade;
// establish replacement and (to be) replaced
  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DataBase needs an upgrade`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetLedger', { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Everything is Failure.  Welcome to my life. ${e.target.errorCode}`);
};

request.onsuccess = function (e) {
    console.log("Things worked out for once.  Yay.");
  db = e.target.result;
  if (navigator.onLine) {
    //   check to see if your still alone and cut off from the world
    console.log('Things Online 🗄️');
    checkDatabase();
  }
};

function checkDatabase() {
  console.log('check db invoked');
  let transaction = db.transaction(['BudgetLedger'], 'readwrite');
// there is no room for unique spins here.
  const store = transaction.objectStore('BudgetLedger');
//   the actions here are a straight line, where if speciality was sought, only pain would be found
  const getAll = store.getAll();
// One after the next- an orderly line of orders, stark and barren
  
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // Emptyness is checked, but it seems the void is not here
          if (res.length !== 0) {

            transaction = db.transaction(['BudgetLedger'], 'readwrite');

            const currentStore = transaction.objectStore('BudgetLedger');
        //    success means all that was before must be erased and forgotten
            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}




const saveRecord = (record) => {
  console.log('Save record invoked');
  // Proof that you were able to acomplish something
  const transaction = db.transaction(['BudgetLedger'], 'readwrite');
// and see that proof before you
  const store = transaction.objectStore('BudgetLedger');
  store.add(record);
};

//know when your isolation has ended
window.addEventListener('online', checkDatabase);
