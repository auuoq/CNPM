import db from "../models/index"
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {}
            let isExist = await checkUserEmail(email);
            if (isExist) {
                //user already exist
                let user = await db.User.findOne({
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
                    where: { email: email },
                    raw: true

                });
                if (user) {      //check user exist 1 more time here because sometime user delete their account during this function is working
                    //compare password
                    let check = await bcrypt.compareSync(password, user.password); //this line can decrypt password in db and also do the comparison
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'OK';

                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User's not found~`;
                }

            } else {
                //return error
                userData.errCode = 1;
                userData.errMessage = `Your email isn't exist, pls try other email`;
            }

            resolve(userData)
        } catch (e) {
            reject(e);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }

            resolve(users);

        } catch (e) {
            reject(e);
        }
    })
}
// userService.js

const getUserInfoByEmail = async (email) => {
    try {
        let user = await db.User.findOne({
            where: { email: email },
            attributes: {
                exclude: ['password'] // Không trả về trường password
            }
        });

        if (!user) {
            return {
                errCode: 1,
                errMessage: "User not found!"
            };
        }

        // Lấy giá trị giới tính từ bảng allcode
        let genderCode = await db.Allcode.findOne({
            where: { keyMap: user.gender, type: 'GENDER' }
        });

        // Thêm thông tin giới tính vào đối tượng user
        if (genderCode) {
            user.gender = genderCode.valueVi; 
        }

        return {
            errCode: 0,
            data: user
        };
    } catch (error) {
        throw error;
    }
};



let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check email is exist?
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already in used, pls try another email!'
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar
                })

                resolve({
                    errCode: 0,
                    message: 'OK'
                });
            }



        } catch (e) {
            reject(e);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let foundUser = await db.User.findOne({
            where: { id: userId }
        })
        if (!foundUser) {
            resolve({
                errCode: 2,
                errMessage: `The user isn't exist`
            })
        }

        await db.User.destroy({
            where: { id: userId }
        })

        resolve({
            errCode: 0,
            message: `The user is deleted`
        })
    })
}

let updateUserData = (data) => {
    /**
     * editUser if you don't edit the raw: false,
     * you can do the same as destroy function in deleteUser with db.User.update({ field ...}, {where: {id : data.id}})
     */
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters'
                })
            }

            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                if (data.avatar) {
                    user.image = data.avatar;
                }


                await user.save();

                resolve({
                    errCode: 0,
                    message: 'Update the user succeeds!'
                })
            }
            else {
                resolve({
                    errCode: 1,
                    errMessage: `User's not found!`
                });
            }

        } catch (e) {
            reject(e);
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters!'
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }



        } catch (e) {
            reject(e);
        }
    })
}

let getUserBookings = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let bookings = await db.Booking.findAll({
                where: { patientId: userId },
                include: [
                    {
                        model: db.User,
                        as: 'doctorData',
                        attributes: ['email', 'firstName', 'address', 'gender'],
                        include: [
                            {
                                model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']
                            }
                        ],
                    },
                    {
                        model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi']
                    },
                    {
                        model: db.Allcode, as: 'statusIdDataPatient', attributes: ['valueEn', 'valueVi']
                    },
                ],
                raw: false,
                nest: true
            })
            

            resolve({
                errCode: 0,
                errMessage: 'OK',
                data: bookings
            });
        } catch (e) {
            reject(e);
        }
    });
};

let deleteAppointment = (appointmentId) => {
    return new Promise(async (resolve, reject) => {
        let foundAppointment = await db.Booking.findOne({
            where: { id: appointmentId }
        })
        if (!foundAppointment) {
            resolve({
                errCode: 2,
                errMessage: `The Appointment isn't exist`
            })
        }

        await db.Booking.destroy({
            where: { id: appointmentId }
        })

        resolve({
            errCode: 0,
            message: `The appointment is deleted`
        })
    })
}

// userService.js

const getDepositInfo = async (appointmentId) => {
    try {
        let bookings = await db.Booking.findAll({
            where: { id: appointmentId },
            include: [
                {
                    model: db.Doctor_Infor,
                    as: 'doctorBooking',
                    attributes: ['priceId', 'paymentId', 'addressClinic', 'nameClinic'],
                    include: [
                        {
                            model: db.Allcode,
                            as: 'priceTypeData',
                            attributes: ['valueEn', 'valueVi']
                        }
                    ],
                },
            ],
            raw: false,
            nest: true
        });

        return {
            errCode: 0,
            errMessage: 'OK',
            data: bookings
        };
    } catch (error) {
        console.error('Error in getDepositInfo service:', error);
        throw error; // Đảm bảo lỗi được ném ra để hàm API có thể xử lý
    }
}




module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService,
    getUserInfoByEmail: getUserInfoByEmail,
    getUserBookings: getUserBookings,
    deleteAppointment: deleteAppointment,
    getDepositInfo: getDepositInfo
}