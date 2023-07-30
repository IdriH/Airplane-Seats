const sqlite3 = require('sqlite3').verbose();
const db = require('./db');



const generateSeats = (planeType, rows, cols, planeId) => {
    let seatIdPrefix = planeType[0].toUpperCase(); // Get the first letter of the type

    for (let rowCounter = 1; rowCounter <= rows; rowCounter++) {
        for (let colCounter = 1; colCounter <= cols; colCounter++) {
            let seatId = `${seatIdPrefix}R${rowCounter}C${colCounter}`;
            let query = `INSERT INTO seats (seat_id, plane_id, status) VALUES ("${seatId}", ${planeId}, "available")`;

            db.run(query, function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`Row(s) inserted: ${this.changes}`);
            });
        }
    }
}

generateSeats('International', 25, 6, 1);
generateSeats('Regional', 20, 5, 2);
generateSeats('Local', 15, 4, 3);

// close the database connection
db.close();
