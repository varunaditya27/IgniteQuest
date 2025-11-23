import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create Participants
    const participants = [
        { name: 'Team Alpha', score: 0 },
        { name: 'Team Beta', score: 0 },
        { name: 'Team Gamma', score: 0 },
        { name: 'Team Delta', score: 0 },
        { name: 'Team Epsilon', score: 0 },
    ]

    for (const p of participants) {
        await prisma.participant.create({
            data: p,
        })
    }

    // Create Questions
    const questions = [
        {
            text: 'Which data structure uses LIFO principle?',
            options: ['Queue', 'Stack', 'Tree', 'Graph'],
            correctOption: 1,
        },
        {
            text: 'What does SQL stand for?',
            options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Sequential Query Language'],
            correctOption: 0,
        },
        {
            text: 'Which of these is NOT a JavaScript framework?',
            options: ['React', 'Angular', 'Vue', 'Django'],
            correctOption: 3,
        },
        {
            text: 'What is the time complexity of binary search?',
            options: ['O(n)', 'O(n^2)', 'O(log n)', 'O(1)'],
            correctOption: 2,
        },
        {
            text: 'Which HTTP method is used to update a resource?',
            options: ['GET', 'POST', 'PUT', 'DELETE'],
            correctOption: 2,
        },
    ]

    for (const q of questions) {
        await prisma.question.create({
            data: q,
        })
    }

    console.log('Seeding completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
