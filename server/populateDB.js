const Course = require("./models/course")
const Student = require("./models/student")
require("dotenv").config()
const connectDB = require("./config/dbConnection")
const readline = require("readline")
const crypto = require("crypto")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

function askQuestion(question) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer)
        })
    })
}

async function main() {
    await connectDB()
    const answer = await askQuestion("Populate Student or Course?")
    while (true) {
        if (answer == "student") {
            const _address = await askQuestion("Student Address:")
            const _id = await askQuestion("Student Id:")
            const _name = await askQuestion("Student Name:")
            const _department = await askQuestion("Department:")
            const _semester = await askQuestion("Student Semester:")
            const _nonce = await crypto.randomBytes(16).toString("hex")

            const newStudent = new Student({
                address: _address,
                id: _id,
                name: _name,
                department: _department,
                semester: parseInt(_semester),
                nonce: _nonce,
            })

            await newStudent.save((err) => {
                if (err) throw err
                console.log("Document saved!")
            })
        } else if (answer == "course") {
            const _courseName = await askQuestion("Course Name:")
            const _ects = await askQuestion("Course ECTS:")
            const _type = await askQuestion("Course Type(mandatory, choice):")
            const _courseSemester = await askQuestion("Course Semester:")
            const _studentId = await askQuestion("Student Id:")
            const _grade = await askQuestion("Student Grade:")

            const newCourse = new Course({
                course: _courseName,
                ects: _ects,
                type: _type,
                courseSemester: _courseSemester,
                studentId: _studentId,
                grade: parseFloat(_grade),
            })

            newCourse.save((err) => {
                if (err) throw err
                console.log("Document saved!")
            })
        }
        const repeat = await askQuestion("Add another?")
        if (repeat == "no") break
        else if (repeat == "yes") continue
    }
    rl.close()
}

main()
