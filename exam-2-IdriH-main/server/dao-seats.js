'use strict';

const db = require('./db');
const dayjs = require("dayjs");

exports.getSeats = (plane_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM seats WHERE plane_id=?';
        db.all(sql, [plane_id], (err, rows) => {
            if (err) { reject(err); }

            const seats = rows.map((e) => {
                const seat = Object.assign({}, e);
                return seat;
            });
            resolve(seats);
        });
    });
}

exports.checkOccupation = (seats_chosen,plane_id) => {
        console.log("Welcome to checkOccupation")
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM seats WHERE plane_id=?';
            db.all(sql, [plane_id], (err, rows) => {
                if (err) { reject(err); }

                const occupiedSeats = rows.filter(seat => seat.status !== 'available');
                const occupiedSeatsIds = occupiedSeats.map(seat => seat.seat_id);
                const seatsChosenIds = seats_chosen.map(seat => seat.seat_id);
                const occupiedChosenSeats = seatsChosenIds.filter(seat => occupiedSeatsIds.includes(seat));

                resolve(occupiedChosenSeats);
            });
        });
    }

    exports.checkIfAlreadyBooked = (plane_id,user_id) => {
        console.log("Welcome to checkifAlreadyBooked")
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM seats WHERE plane_id=? AND user_id=?';
            db.all(sql, [plane_id,user_id], (err, rows) => {
                if (err) { reject(err); }
                
                if(rows.length>0){
                    console.log("WE are hbere")
                    resolve({error: 'you already booked a seat in this plane'});
                }else{

                resolve(true);
                }    
            });
        });
    }

    exports.updateSeats = (seats_chosen,plane_id,user_id) => {
        console.log("Welcome to updateSeats")
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE seats SET status=?,user_id=? WHERE seat_id=?';
            seats_chosen.forEach(seat => {
            //can be seat.seat_id instead of seat.id 
            db.run(sql, ['occupied',user_id,seat.seat_id], (err) => {
                if (err) { reject(err); }
                resolve(true);
            }
            )});
        })
    }

    exports.getBooking = (user_id,plane_id) => {
        console.log("Welcome to getBookings")
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM seats WHERE user_id=? AND plane_id=?';
            db.all(sql, [user_id,plane_id], (err, rows) => {
                if (err) { reject(err); }
                const seats = rows.map((e) => {
                    const seat = Object.assign({}, e);
                    return seat;
                });
                resolve(seats);
            }
            )
        })
    }

    exports.deleteBooking = (user_id,plane_id) => {
        console.log("Welcome to deleteBooking")
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE seats SET status=?,user_id=? WHERE plane_id=? AND user_id=?';
            db.run(sql, ['available',null,plane_id,user_id], (err) => {
                if (err) { reject(err); }
                resolve(true);
            }
            )
        })
    }

    exports.randomBooking = async (plane_id, user_id, number_of_seats) => {
        console.log("Welcome to randomBooking")
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM seats WHERE plane_id=? AND status="available"';
            db.all(sql, [plane_id], async (err, rows) => {
                if (err) { reject(err); }
                
                // If not enough seats are available
                if(rows.length < number_of_seats) {
                    reject({error: 'Not enough seats available'});
                    return;
                }
                
               // Randomly selecting seats
                let seats_to_book = [];
                for(let i = 0; i < number_of_seats; i++){
                    let randomIndex = Math.floor(Math.random() * rows.length);
                    let selectedSeat = rows[randomIndex];
                    seats_to_book.push({seat_id: selectedSeat.seat_id}); // only keep the seat_id property
                    rows.splice(randomIndex, 1); // Removing selected seat from available seats
                }
                console.log("!!!!!!!!!!!!!!!"+seats_to_book);
                
                seats_to_book.map(a => a.seat_id).forEach(console.log)
                
                
                
                try {
                    //check if user has already booked a seat in this plane
                    const check = await exports.checkIfAlreadyBooked(plane_id,user_id);
                    console.log("!!!!!!!!!!!" + check.error )
                    if(check.error){
                         resolve({error: 'User already booked a seat in this plane'});
                        return;
                        }
                } catch(err) {
                     reject(err);
                }
                
                
                try {
                    const occupiedSeats = await exports.checkOccupation(seats_to_book,plane_id);
                    if(occupiedSeats.length > 0){
                         resolve({error: 'Some chosen seats are already booked'});
                         return;   
                        }
                } catch(err) {
                 reject(err);
                }
                
                try {
                    // Updating selected seats to be occupied by user
                    for(let seat of seats_to_book){
                        const sql = 'UPDATE seats SET status="occupied", user_id=? WHERE seat_id=?';
                        await new Promise((resolve, reject) => {
                            db.run(sql, [user_id, seat.seat_id], (err) => {
                                if (err) { reject(err); }
                                resolve(true);
                            });
                        });
                    }
                    
                    resolve({message: 'Successfully booked', seats: seats_to_book});
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    exports.getAvailableSeats = (plane_id) => {
        console.log("Welcome to getAvailableSeats")
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM seats WHERE plane_id=? AND status="available"';
            db.all(sql, [plane_id], (err, rows) => {
                if (err) { reject(err); }
                
                resolve(rows.length);
            }
            )
        })
    }
    